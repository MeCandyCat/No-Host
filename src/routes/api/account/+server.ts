import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const DISCORD_TOKEN:any = process.env.DISCORD_TOKEN;
const ACCOUNT_CHANNEL_ID = '1282634666939121664'; // Replace with your actual account channel ID

interface AccountData {
    username: string;
    password: string;
    createdAt: string;
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function getAccounts(): Promise<AccountData[]> {
    try {
        const messages: any[] = (await rest.get(Routes.channelMessages(ACCOUNT_CHANNEL_ID))) as any[];
        return messages
            .map((msg) => {
                try {
                    return JSON.parse(msg.content) as AccountData;
                } catch (error) {
                    console.error('Error parsing account data:', error);
                    return null;
                }
            })
            .filter((account): account is AccountData => account !== null);
    } catch (error) {
        console.error('Error fetching accounts from Discord:', error);
        throw new Error('Failed to fetch accounts');
    }
}

async function createAccount(username: string, password: string): Promise<void> {
    const accountData: AccountData = {
        username,
        password,
        createdAt: new Date().toISOString()
    };
    await rest.post(Routes.channelMessages(ACCOUNT_CHANNEL_ID), {
        body: { content: JSON.stringify(accountData) }
    });
}

export const POST: RequestHandler = async ({ request }) => {
    if (!DISCORD_TOKEN) {
        console.error('Discord bot token is not set in the environment variables');
        return json({ error: 'Internal server error' }, { status: 500 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
        return json({ error: 'Username and password are required' }, { status: 400 });
    }

    try {
        const accounts = await getAccounts();
        const existingAccount = accounts.find(account => account.username === username);

        if (existingAccount) {
            // Login
            if (existingAccount.password === password) {
                return json({ message: 'Login successful', username });
            } else {
                return json({ error: 'Invalid credentials' }, { status: 401 });
            }
        } else {
            // Registration
            await createAccount(username, password);
            return json({ message: 'Account created successfully', username });
        }
    } catch (error) {
        console.error('Error processing account request:', error);
        return json({ error: 'Failed to process request' }, { status: 500 });
    }
};