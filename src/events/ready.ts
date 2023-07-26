import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base';
import GuildSettings from '../models/guildSettings';
import { generateDefaultSettings } from '../handlers/mongoDBHandler';

export default <ShrimpEvent>{
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const { infoLogger } = client;
		infoLogger.info(`Logged in as ${client.user?.tag}!`);

		for (const [, guild] of client.guilds.cache) {
			if (await GuildSettings.exists({ guildId: guild.id })) {
				//updateDB(guild); //TODO Add function to update guildSettings in case new settings are added, keeping original settings as they were before
				return;
			}

			const guildSettings = await generateDefaultSettings(guild);

			infoLogger.info(`MongoDB: Added Guildsettings for ${guildSettings.guildName}`);
		}
	},
};
