import { ActivityType, GatewayIntentBits } from "discord.js";
import os from 'node:os';

import { ShrimpClient } from "./common/base";
import eventHandler from "./handlers/eventHandler";
import commandHandler from "./handlers/commandHandler";

if (Number(process.version.slice(1).split('.')[0]) < 16) {
	throw new Error('NodeJS 16.9.0 or higher is required. Re-run the bot with the correct NodeJS version.');
}

const client = new ShrimpClient({
	intents: [
		GatewayIntentBits.Guilds
	],
	presence: {
		status: 'online',
		afk: false,
		activities: [
			{
				name: 'the planktoons',
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				type: ActivityType.Watching,
			}
		]
	},
	ws: {
		properties: {
			// Just lookin if these show up anywhere
			os: os.platform(),
			browser: 'Discord Android',
			device: 'Expensive Smart Toaster©'
		}
	}
})

const { infoLogger, errorLogger } = client;

(async function main(): Promise<void> {
	infoLogger.info(`Shrimp is booting...`)
	await eventHandler(client);
	await commandHandler(client);

	try {
		client.login(process.env.DISCORD_TOKEN);
	} catch (error) {
		if (error instanceof Error) {
			errorLogger.error(`Login: ${error.message}`);
		} else {
			errorLogger.error(`Login: ${error}`);
		}
	}
}());