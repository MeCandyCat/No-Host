<script>
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { MessageSquare, CloudOff, Zap, DollarSign, Github, Sun, Moon } from 'lucide-svelte';
	import { toggleMode } from 'mode-watcher';

	const features = [
		{
			icon: CloudOff,
			title: 'No Backend',
			description: 'Our projects run without traditional server infrastructure.'
		},
		{
			icon: Zap,
			title: 'Lightning Fast',
			description: 'Enjoy rapid load times and responsive applications.'
		},
		{
			icon: DollarSign,
			title: '100% Free',
			description: 'All our services are completely free to use.'
		}
	];
</script>

<main
	class="min-h-screen bg-gray-100 text-gray-800 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-200"
>
	<header class="bg-white shadow-md dark:bg-gray-900">
		<nav class="container mx-auto flex flex-col items-center justify-between px-4 py-4 sm:flex-row">
			<div class="mb-4 flex w-full items-center justify-between sm:mb-0 sm:w-auto">
				<h1 class="text-2xl font-bold text-gray-800 dark:text-white">No Host</h1>
				<Button on:click={toggleMode} variant="outline" size="icon" class="sm:hidden">
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
			<div class="flex items-center space-x-4">
				<Button on:click={toggleMode} variant="outline" size="icon" class="hidden sm:inline-flex">
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</nav>
	</header>

	<div class="container mx-auto px-4 py-8">
		<section class="mb-12">
			<h2 class="mb-4 text-3xl font-bold">Welcome to No Host</h2>
			<p class="text-gray-600 dark:text-gray-400">
				A collection of projects made with Svelte and other web technologies that provide a fast and
				no-backend solution. This is for fun and learning purposes only.
			</p>
		</section>

		<section class="mb-12">
			<h3 class="mb-4 text-2xl font-bold">Featured Project: Chat without Database</h3>
			<Card.Root class="dark:bg-gray-900">
				<Card.Header>
					<Card.Title class="flex items-center">
						<MessageSquare class="mr-2 h-6 w-6 text-blue-500" />
						Serverless Chat
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="mb-4 text-gray-600 dark:text-gray-400">
						Experience our cutting-edge chat system that operates without a traditional database
						backend.
					</p>
				</Card.Content>
				<Card.Footer>
					<Button variant="default" href="/chat">Try it out</Button>
				</Card.Footer>
			</Card.Root>
		</section>

		<section class="mb-12">
			<h3 class="mb-4 text-2xl font-bold">How It Works</h3>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as feature}
					<Card.Root class="dark:bg-gray-900">
						<Card.Header>
							<Card.Title class="flex items-center">
								<svelte:component this={feature.icon} class="mr-2 h-8 w-8" />
								{feature.title}
							</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="text-gray-600 dark:text-gray-400">{feature.description}</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</section>

		<section class="mb-12">
			<h3 class="mb-4 text-2xl font-bold">Contribute to No Host</h3>
			<Card.Root class="dark:bg-gray-900">
				<Card.Header>
					<Card.Title class="flex items-center">
						<Github class="mr-2 h-6 w-6" />
						Open Source
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="mb-4 text-gray-600 dark:text-gray-400">
						No Host is an open-source project hosted on Netlify. We welcome contributions from
						developers of all skill levels!
					</p>
					<p class="mb-4 text-gray-600 dark:text-gray-400">
						Whether you want to fix a bug, add a feature, or improve our documentation, your help is
						appreciated.
					</p>
				</Card.Content>
				<Card.Footer class="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
					<Button
						variant="outline"
						class="w-full sm:w-auto"
						href="https://github.com/MeCandyCat/No-Host"
					>
						<Github class="mr-2 h-4 w-4" />
						View on GitHub
					</Button>
				</Card.Footer>
			</Card.Root>
		</section>
	</div>

	<footer class="mt-12 bg-gray-800 py-6 text-white dark:bg-black">
		<div class="container mx-auto px-4 text-center">
			<p>&copy; 2024 No Host. All rights reserved.</p>
		</div>
	</footer>
</main>
