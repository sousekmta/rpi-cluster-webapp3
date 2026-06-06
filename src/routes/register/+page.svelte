<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
</script>

<div class="flex items-center justify-center min-h-screen bg-muted/40">
	<div class="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-sm border">
		<h1 class="text-2xl font-bold text-center">Create an account</h1>
		<form method="POST" use:enhance class="space-y-4">
			{#if form?.message}
				<p class="text-sm text-destructive">{form.message}</p>
			{/if}
			<div class="space-y-2">
				<label for="email" class="text-sm font-medium">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>
			<div class="space-y-2">
				<label for="password" class="text-sm font-medium">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>
			<button
				type="submit"
				class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
			>
				Sign Up
			</button>
		</form>
		<p class="text-sm text-center text-muted-foreground">
			Already have an account? <a href="/login" class="text-primary hover:underline">Sign in</a>
		</p>
	</div>
</div>
