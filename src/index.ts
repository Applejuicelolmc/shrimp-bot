import { ShrimpClient } from './common/base.js';
import DBHandler from './handlers/mongoDBHandler.js';
import eventHandler from './handlers/eventHandler.js';
import commandHandler from './handlers/commandHandler.js';
import { ActivityType, GatewayIntentBits } from 'discord.js';

export const client = new ShrimpClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildMessageReactions,
	],
	presence: {
		status: 'dnd',
		afk: false,
		activities: [
			{
				name: `Starting up...`,
				type: ActivityType.Custom,
			},
		],
	},
});

(async function main(): Promise<void> {
	client.infoLogger.info(`Shrimp is booting... (PID: ${process.pid})`);

	try {
		await client.login();
	} catch (error) {
		client.handleError('Login', error as Error);
	}

	if (process.argv.includes('update-avatar')) {
		try {
			await client.changeAvatar();
		} catch (error) {
			client.handleError('change avatar', error as Error);
		}
	}

	//TODO: There must be a better way...
	await eventHandler(client);
	await DBHandler(client);
	await commandHandler(client);
})();
