import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fetch from 'node-fetch';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { DISCORD_WEBHOOK_URL } from '$env/static/private';
import { DISCORD_TOKEN } from '$env/static/private';

const ACCOUNT_CHANNEL_ID = '1282634666939121664';
const cooldown = 5000;
let lastRequestTime = 0;
const maxDescriptionLength = 1000;

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

function rateLimit(): boolean {
	const now = Date.now();
	if (now - lastRequestTime < cooldown) {
		return false;
	}
	lastRequestTime = now;
	return true;
}

async function getAccounts(): Promise<any[]> {
	try {
		const messages: any[] = (await rest.get(Routes.channelMessages(ACCOUNT_CHANNEL_ID))) as any[];
		return messages.map((msg) => JSON.parse(msg.content));
	} catch (error) {
		console.error('Error fetching accounts from Discord:', error);
		throw new Error('Failed to fetch accounts');
	}
}

async function verifyToken(token: string): Promise<string | null> {
	const accounts = await getAccounts();
	const account = accounts.find((acc) => acc.token === token);
	return account ? account.username : null;
}

export const POST: RequestHandler = async ({ request }) => {
	if (!rateLimit()) {
		return json({ error: 'Too many requests' }, { status: 429 });
	}

	const { token, message } = await request.json();

	if (!token) {
		return json({ error: 'Token is required' }, { status: 400 });
	}

	if (!message || message.length > maxDescriptionLength) {
		return json(
			{ error: `Message is required and cannot exceed ${maxDescriptionLength} characters` },
			{ status: 400 }
		);
	}

	const username = await verifyToken(token);
	if (!username) {
		return json({ error: 'Invalid token' }, { status: 401 });
	}

	if (!DISCORD_WEBHOOK_URL) {
		console.error('Discord webhook URL is not set in the environment variables');
		return json({ error: 'Internal server error' }, { status: 500 });
	}

	const timestamp = new Date().toISOString();

	try {
		const response = await fetch(DISCORD_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: `
{
  "name": "${username}",
  "description": "${message}",
  "timestamp": "${timestamp}"
}
`
			})
		});

		if (!response.ok) {
			throw new Error(`Discord API responded with status ${response.status}`);
		}

		return json({ message: 'Message sent successfully', timestamp });
	} catch (error) {
		console.error('Error sending webhook to Discord:', error);
		return json({ error: 'Failed to send message' }, { status: 500 });
	}
};
