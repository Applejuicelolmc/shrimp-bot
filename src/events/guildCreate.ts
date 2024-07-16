import { Events, Guild } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';
import { generateDefaultSettings } from '../handlers/mongoDBHandler.js';

export default <ShrimpEvent>{
	name: Events.GuildCreate,
	once: false,
	async execute(client, guild: Guild) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		try {
			client.infoLogger.info(`Joined new guild: ${guild.name} (${guild.id})`);
			generateDefaultSettings(guild);
		} catch (error) {
			client.handleError('guildCreate event', error as Error);
		}
	},
};
