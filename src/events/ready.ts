import { ShrimpEvent } from '../common/base.js';
import GuildSettings from '../models/guildSettings.js';
import { bold, Colors, EmbedBuilder, Events } from 'discord.js';
import { generateDefaultSettings } from '../handlers/mongoDBHandler.js';

export default <ShrimpEvent>{
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.infoLogger.info(`Logged in as ${client.user?.tag}!`);

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

		client.setHealthStatus(true);

		for (const [, guild] of client.guilds.cache) {
			if (await GuildSettings.exists({ guildId: guild.id })) {
				//updateDB(guild); //TODO Add function to update guildSettings in case new settings are added, keeping original settings as they were before
				return;
			}

			const guildSettings = await generateDefaultSettings(guild);

			client.infoLogger.info(`MongoDB: Added Guildsettings for ${guildSettings.guildName}`);
		}
	},
};
