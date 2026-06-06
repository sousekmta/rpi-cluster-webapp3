<script lang="ts">
	import { UploadCloud, File as FileIcon, Image as ImageIcon, Film, Trash2, Download, Eye } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let files = data.files;
	$: files = data.files;

	let isDragging = false;
	let isUploading = false;
	let uploadProgress = 0;

	let previewUrl: string | null = null;
	let previewType: string | null = null;

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			await uploadFiles(Array.from(e.dataTransfer.files));
		}
	}

	async function handleFileInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			await uploadFiles(Array.from(target.files));
		}
	}

	async function uploadFiles(filesToUpload: globalThis.File[]) {
		isUploading = true;
		
		for (const file of filesToUpload) {
			try {
				// 1. Get presigned URL
				const res = await fetch('/api/upload', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ filename: file.name, contentType: file.type })
				});
				
				if (!res.ok) throw new Error('Failed to get upload URL');
				const { presignedUrl, s3Key } = await res.json();

				// 2. Upload to S3
				const uploadRes = await fetch(presignedUrl, {
					method: 'PUT',
					headers: { 'Content-Type': file.type },
					body: file
				});

				if (!uploadRes.ok) throw new Error('Failed to upload to S3');

				// 3. Save to database
				await fetch('/api/files', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: file.name,
						type: file.type,
						size: file.size,
						s3Key
					})
				});

			} catch (err) {
				console.error("Upload error:", err);
				alert(`Failed to upload ${file.name}`);
			}
		}
		
		isUploading = false;
		invalidateAll();
	}

	async function deleteFile(id: string) {
		if (!confirm('Are you sure you want to delete this file?')) return;
		
		const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
		if (res.ok) {
			invalidateAll();
		} else {
			alert('Failed to delete file');
		}
	}

	async function getDownloadUrl(id: string) {
		const res = await fetch(`/api/files/${id}/download`);
		if (!res.ok) throw new Error('Failed to get download URL');
		const { downloadUrl } = await res.json();
		return downloadUrl;
	}

	async function previewFile(file: any) {
		try {
			const url = await getDownloadUrl(file.id);
			previewUrl = url;
			previewType = file.type;
		} catch (e) {
			alert('Cannot preview this file.');
		}
	}

	async function downloadFile(file: any) {
		try {
			const url = await getDownloadUrl(file.id);
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (e) {
			alert('Cannot download this file.');
		}
	}

	function closePreview() {
		previewUrl = null;
		previewType = null;
	}

	function formatBytes(bytes: number, decimals = 2) {
		if (!+bytes) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
</script>

<div class="space-y-8">
	<!-- Upload Zone -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="border-2 border-dashed rounded-lg p-12 text-center transition-colors {isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}"
		on:dragenter|preventDefault={() => isDragging = true}
		on:dragleave|preventDefault={() => isDragging = false}
		on:dragover|preventDefault
		on:drop={handleDrop}
	>
		<UploadCloud class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
		<h3 class="text-lg font-semibold">Drag & drop files here</h3>
		<p class="text-sm text-muted-foreground mt-1 mb-4">or click to select files</p>
		
		<input
			type="file"
			id="file-upload"
			class="hidden"
			multiple
			on:change={handleFileInput}
			disabled={isUploading}
		/>
		<label
			for="file-upload"
			class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
		>
			{isUploading ? 'Uploading...' : 'Browse Files'}
		</label>
	</div>

	<!-- Files Grid -->
	<div>
		<h2 class="text-xl font-semibold mb-4">My Files</h2>
		{#if files.length === 0}
			<div class="text-center p-8 border rounded-lg bg-card text-muted-foreground">
				No files uploaded yet.
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each files as file}
					<div class="group border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors relative flex flex-col">
						<div class="flex-1 flex items-center justify-center py-6">
							{#if file.type.startsWith('image/')}
								<ImageIcon class="h-16 w-16 text-blue-500/80" />
							{:else if file.type.startsWith('video/')}
								<Film class="h-16 w-16 text-purple-500/80" />
							{:else}
								<FileIcon class="h-16 w-16 text-muted-foreground" />
							{/if}
						</div>
						
						<div class="mt-4 truncate">
							<p class="text-sm font-medium truncate" title={file.name}>{file.name}</p>
							<p class="text-xs text-muted-foreground mt-1">{formatBytes(file.size)} • {new Date(file.createdAt).toLocaleDateString()}</p>
						</div>

						<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/80 backdrop-blur rounded-md p-1 shadow-sm border">
							{#if file.type.startsWith('image/') || file.type.startsWith('video/')}
								<button class="p-1.5 hover:bg-muted rounded text-foreground" on:click={() => previewFile(file)} title="Preview">
									<Eye class="h-4 w-4" />
								</button>
							{/if}
							<button class="p-1.5 hover:bg-muted rounded text-foreground" on:click={() => downloadFile(file)} title="Download">
								<Download class="h-4 w-4" />
							</button>
							<button class="p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded text-destructive" on:click={() => deleteFile(file.id)} title="Delete">
								<Trash2 class="h-4 w-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Preview Modal -->
{#if previewUrl}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" on:click={closePreview}>
		<div class="relative bg-black rounded-lg shadow-xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex items-center justify-center border" on:click|stopPropagation>
			<button class="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 p-2 rounded-full" on:click={closePreview}>
				Close
			</button>
			
			{#if previewType?.startsWith('image/')}
				<img src={previewUrl} alt="Preview" class="max-w-full max-h-[90vh] object-contain" />
			{:else if previewType?.startsWith('video/')}
				<video src={previewUrl} controls autoplay class="max-w-full max-h-[90vh] w-full outline-none">
					<track kind="captions" />
				</video>
			{:else}
				<div class="p-12 text-white text-center">
					<p>Preview not available for this file type.</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
