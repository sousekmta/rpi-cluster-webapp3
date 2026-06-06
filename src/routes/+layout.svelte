<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { toggleMode } from 'mode-watcher';
	import { Sun, Moon, LogOut, Cloud } from 'lucide-svelte';
	import '../app.pcss';

	export let data;
</script>

<ModeWatcher />

<div class="min-h-screen flex flex-col bg-background text-foreground">
	<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container mx-auto flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2 font-bold text-lg">
				<Cloud class="h-6 w-6 text-primary" />
				MTA drive
			</div>
			
			<div class="flex items-center gap-4">
				<button 
					on:click={toggleMode} 
					class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
				>
					<Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span class="sr-only">Toggle theme</span>
				</button>
				
				{#if data.user}
					<span class="text-sm text-muted-foreground hidden sm:inline-block">
						{data.user.email}
					</span>
					<form action="/logout" method="POST" class="inline">
						<button 
							type="submit" 
							class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground h-9 px-3 gap-2"
						>
							<LogOut class="h-4 w-4" />
							<span class="hidden sm:inline-block">Sign out</span>
						</button>
					</form>
				{/if}
			</div>
		</div>
	</header>

	<main class="flex-1 container mx-auto p-4 md:p-8">
		<slot />
	</main>

	<footer class="py-6 border-t mt-auto">
		<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
			&copy; MTA {new Date().getFullYear()}
		</div>
	</footer>
</div>
