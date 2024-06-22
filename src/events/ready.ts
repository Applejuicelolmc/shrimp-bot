import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.ts';
import GuildSettings from '../models/guildSettings.ts';
import { generateDefaultSettings } from '../handlers/mongoDBHandler.ts';

export default <ShrimpEvent>{
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		client.infoLogger.info(`Logged in as ${client.user?.tag}!`);

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
