<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { onMount, afterUpdate } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Account from '$lib/components/account.svelte';
	import Send from 'lucide-svelte/icons/send';
	import Cookies from 'js-cookie';

	interface Message {
		name: string;
		description: string;
		timestamp: string;
	}

	interface UserData {
		isLoggedIn: boolean;
		username: string;
		token: string | null;
	}

	let description = '';
	let messages: Message[] = [];
	let error = '';
	let chatContainer: HTMLDivElement;
	let autoscroll = true;
	let userData: UserData = {
		isLoggedIn: false,
		username: '',
		token: null
	};

	const maxDescriptionLength = 1000;

	function loadUserData() {
		const token = Cookies.get('token');
		const username = Cookies.get('username');
		userData = {
			isLoggedIn: !!token,
			username: username || '',
			token: token || null
		};
	}

	function saveUserData() {
		if (userData.isLoggedIn && userData.token) {
			Cookies.set('token', userData.token, { expires: 7 }); // Expires in 7 days
			Cookies.set('username', userData.username, { expires: 7 });
		} else {
			Cookies.remove('token');
			Cookies.remove('username');
		}
	}

	onMount(async () => {
		loadUserData();
		try {
			const response = await fetch('/api/chat-log');
			if (!response.ok) {
				throw new Error('Failed to fetch chat log');
			}
			const data = await response.json();
			messages = data.messages.slice(-25);
		} catch (err) {
			console.error('Error fetching chat log:', err);
			error = 'Failed to load chat history';
		}
	});

	afterUpdate(() => {
		if (autoscroll) {
			chatContainer.scrollTo(0, chatContainer.scrollHeight);
		}
	});

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	function formatTimestamp(isoString: string): string {
		const date = new Date(isoString);

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();

		const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

		return `${day}/${month}/${year} ${time}`;
	}

	const sendMessage = async () => {
		error = '';

		if (!userData.isLoggedIn) {
			error = 'You must be logged in to send messages';
			return;
		}

		if (!userData.token) {
			error = 'Authentication token is missing. Please log in again.';
			return;
		}

		if (!description.trim()) {
			error = 'Message cannot be empty';
			return;
		}

		if (description.length > maxDescriptionLength) {
			error = `Message cannot exceed ${maxDescriptionLength} characters`;
			return;
		}

		const apiUrl = '/api/webhook';
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token: userData.token, message: description })
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'Failed to send message');
			}
			messages = [
				...messages,
				{ name: userData.username, description, timestamp: result.timestamp }
			];
			description = '';
			autoscroll = true;
			toast.success('Message sent successfully');
		} catch (err: unknown) {
			console.error('Error sending message:', err);
			error = err instanceof Error ? err.message : 'An error occurred while sending the message';
		}
	};

	function handleScroll() {
		const { scrollTop, clientHeight, scrollHeight } = chatContainer;
		autoscroll = scrollTop + clientHeight >= scrollHeight - 20;
	}

	function handleLogin(event: CustomEvent<{ username: string; token: string }>) {
		userData = {
			isLoggedIn: true,
			username: event.detail.username,
			token: event.detail.token
		};
		saveUserData();
	}

	function handleLogout() {
		userData = {
			isLoggedIn: false,
			username: '',
			token: null
		};
		saveUserData();
	}
</script>

<div class="flex h-screen flex-col">
	<div class="flex items-center justify-between p-4">
		<h1 class="text-2xl font-bold">Chat</h1>
		<Account on:login={handleLogin} on:logout={handleLogout} />
	</div>
	<div bind:this={chatContainer} on:scroll={handleScroll} class="flex-grow overflow-y-auto p-4">
		{#each messages as msg}
			<div class="mb-4 flex items-start">
				<Avatar class="mr-2">
					<AvatarFallback>{getInitials(msg.name)}</AvatarFallback>
				</Avatar>
				<div class="w-[90vw] flex-grow">
					<div class="flex items-baseline">
						<strong class="mr-2">{msg.name}</strong>
						<span class="text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
					</div>
					<p class="break-words">{msg.description}</p>
				</div>
			</div>
		{/each}
	</div>
	<div class="p-4">
		{#if error}
			<div class="mb-2 text-red-500">{error}</div>
		{/if}
		<div class="flex flex-col items-start sm:flex-row sm:items-end">
			<div class="mb-2 mr-2 flex flex-col items-center sm:mb-0">
				<Avatar class="mb-2">
					<AvatarFallback>{getInitials(userData.username)}</AvatarFallback>
				</Avatar>
			</div>
			<div class="flex-grow">
				<Textarea
					placeholder={userData.isLoggedIn
						? 'Type your message...'
						: 'Please log in to send messages'}
					bind:value={description}
					disabled={!userData.isLoggedIn}
					class="mb-2 max-h-40 min-h-12 w-full"
				/>
			</div>
			<div class="mt-2 flex items-center sm:ml-2 sm:mt-0">
				<Button
					size="icon"
					class="flex items-center justify-center text-center"
					on:click={sendMessage}
					disabled={!userData.isLoggedIn}
				>
					<Send class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div>
