import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { DISCORD_TOKEN } from '$env/static/private';

const CHANNEL_ID = '1282357550242857020';
const MESSAGES_PER_PAGE = 20;

interface ParsedMessage {
	id: string;
	name: string;
	description: string;
	timestamp: string;
}

export const GET: RequestHandler = async ({ url }) => {
	if (!DISCORD_TOKEN) {
		console.error('Discord bot token is not set in the environment variables');
		return json({ error: 'Internal server error' }, { status: 500 });
	}

	const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = MESSAGES_PER_PAGE;

	try {
		const allMessages: any[] = (await rest.get(Routes.channelMessages(CHANNEL_ID), {
			query: { limit: page * limit }
		})) as any[];

		const paginatedMessages = allMessages.slice((page - 1) * limit, page * limit);

		const parsedMessages: ParsedMessage[] = paginatedMessages
			.map((msg) => {
				try {
					const content = JSON.parse(msg.content.replace(/`json|\n|`/g, ''));

					const name = content.name.substring(0, 32);

					return {
						id: msg.id,
						name,
						description: content.description.substring(0, 1000),
						timestamp: content.timestamp
					};
				} catch (error) {
					console.error('Error parsing message:', error);
					return null;
				}
			})
			.filter((msg): msg is ParsedMessage => msg !== null)
			.reverse();

		return json({
			messages: parsedMessages,
			hasMore: allMessages.length > page * limit
		});
	} catch (error) {
		console.error('Error fetching messages from Discord:', error);
		return json({ error: 'Failed to fetch messages' }, { status: 500 });
	}
};
