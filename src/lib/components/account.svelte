<script lang="ts">
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher, onMount } from 'svelte';
	import User from 'lucide-svelte/icons/user';
	import Cookies from 'js-cookie';

	const dispatch = createEventDispatcher();

	let username = '';
	let password = '';
	let isOpen = false;
	let isLoggedIn = false;

	onMount(() => {
		const storedUsername = Cookies.get('username');
		const storedToken = Cookies.get('token');
		if (storedUsername && storedToken) {
			isLoggedIn = true;
			username = storedUsername;
			dispatch('login', { username, token: storedToken });
		}
	});

	async function handleLogin() {
		try {
			const response = await fetch('/api/account', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (response.ok) {
				isLoggedIn = true;
				Cookies.set('username', username, { expires: 30 });
				Cookies.set('token', data.token, { expires: 30 });
				dispatch('login', { username, token: data.token });
				toast.success(data.message);
				isOpen = false;
			} else {
				toast.error(data.error);
			}
		} catch (error) {
			toast.error('An unexpected error occurred');
		}
	}

	function handleLogout() {
		isLoggedIn = false;
		username = '';
		Cookies.remove('username');
		Cookies.remove('token');
		dispatch('logout');
		toast.success('Logged out successfully');
	}
</script>

<div class="flex items-center space-x-2">
	{#if isLoggedIn}
		<span>{username}</span>
		<Button on:click={handleLogout}>Logout</Button>
	{:else}
		<Dialog.Root bind:open={isOpen}>
			<Dialog.Trigger>
				<Avatar class="cursor-pointer">
					<AvatarFallback><User /></AvatarFallback>
				</Avatar>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>Account</Dialog.Title>
					<Dialog.Description>
						Enter your username and password to login or create an account.
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="username" class="text-right">Username</Label>
						<Input id="username" bind:value={username} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="password" class="text-right">Password</Label>
						<Input id="password" type="password" bind:value={password} class="col-span-3" />
					</div>
				</div>
				<Dialog.Footer>
					<Button on:click={handleLogin}>Login</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
</div>
