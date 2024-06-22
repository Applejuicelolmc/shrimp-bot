import { ShrimpClient } from './common/base.ts';
import DBHandler from './handlers/mongoDBHandler.ts';
import eventHandler from './handlers/eventHandler.ts';
import commandHandler from './handlers/commandHandler.ts';
import { ActivityType, Colors, EmbedBuilder, GatewayIntentBits, bold } from 'discord.js';

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
