import { ActivityType, Colors, EmbedBuilder, GatewayIntentBits, bold } from 'discord.js';
import { ShrimpClient } from './common/base.js';
import eventHandler from './handlers/eventHandler.js';
import commandHandler from './handlers/commandHandler.js';
import DBHandler from './handlers/mongoDBHandler.js';

if (Number(process.version.slice(1).split('.')[0]) < 18) {
	throw new Error('NodeJS 18.15.0 or higher is required. Re-run the bot with the correct NodeJS version.');
}

export const client = new ShrimpClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildPresences,
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

	await client.alertWebhook.send({
		embeds: [
			new EmbedBuilder()
				.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
				.addFields({
					name: `${bold(`Event:`)}`,
					value: `Logged in (PID: ${process.pid})`,
				})
				.setColor(Colors.Aqua),
		],
	});

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
