import { ActivityType, GatewayIntentBits } from 'discord.js';
import { ShrimpClient } from './common/base';
import eventHandler from './handlers/eventHandler';
import commandHandler from './handlers/commandHandler';
import DBHandler from './handlers/mongoDBHandler';

if (Number(process.version.slice(1).split('.')[0]) < 16) {
	throw new Error('NodeJS 16.9.0 or higher is required. Re-run the bot with the correct NodeJS version.');
}

const client = new ShrimpClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
	presence: {
		status: 'online',
		afk: false,
		activities: [
			{
				name: 'the planktoons',
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				type: ActivityType.Watching,
			},
		],
	},
});

(async function main(): Promise<void> {
	client.infoLogger.info(`Shrimp is booting... (PID: ${process.pid})`);

	try {
		client.login(process.env.DISCORD_TOKEN);
	} catch (error) {
		client.handleError('Login', error as Error);
	}

	await eventHandler(client);
	await DBHandler(client);
	await commandHandler(client);
})();
