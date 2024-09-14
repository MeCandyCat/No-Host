<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { onMount, afterUpdate } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Account from '$lib/components/account.svelte';
	import { userStore } from '$lib/stores/userStore';
	import Send from 'lucide-svelte/icons/send';

	interface Message {
		name: string;
		description: string;
		timestamp: string;
	}

	let name = '';
	let description = '';
	let messages: Message[] = [];
	let error = '';
	let chatContainer: HTMLDivElement;
	let autoscroll = true;

	const maxNameLength = 32;
	const maxDescriptionLength = 1000;

	onMount(async () => {
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
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	const sendMessage = async () => {
		if (!$userStore.isLoggedIn) {
			error = 'You must be logged in to send messages';
			return;
		}

		if (!description || description.length > maxDescriptionLength) {
			error = `Description is required and cannot exceed ${maxDescriptionLength} characters`;
			return;
		}
		error = '';
		const apiUrl = '/api/webhook';
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: $userStore.username, message: description })
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'Failed to send message');
			}
			messages = [
				...messages,
				{ name: $userStore.username, description, timestamp: result.timestamp }
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
</script>

<div class="flex h-screen flex-col">
	<div class="flex items-center justify-between p-4">
		<h1 class="text-2xl font-bold">Chat</h1>
		<Account />
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
					<AvatarFallback>{getInitials($userStore.username)}</AvatarFallback>
				</Avatar>
			</div>
			<div class="flex-grow">
				<Textarea
					placeholder={$userStore.isLoggedIn
						? 'Type your message...'
						: 'Please log in to send messages'}
					bind:value={description}
					disabled={!$userStore.isLoggedIn}
					class="mb-2 max-h-40 min-h-12 w-full"
				/>
			</div>
			<div class="mt-2 flex items-center sm:ml-2 sm:mt-0">
				<Button
					size="icon"
					class="flex items-center justify-center text-center"
					on:click={sendMessage}
					disabled={!$userStore.isLoggedIn}
				>
					<Send class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div>
