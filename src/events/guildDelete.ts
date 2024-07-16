import { Events, Guild } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';
import GuildSettings from '../models/guildSettings.js';

export default <ShrimpEvent>{
	name: Events.GuildCreate,
	once: false,
	async execute(client, guild: Guild) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		const guildSettings = await GuildSettings.findOne({
			guildId: guild.id,
		});

		try {
			client.infoLogger.info(`Left a guild: ${guild.name} (${guild.id})`);
			guildSettings?.deleteOne();
		} catch (error) {
			client.handleError('guildCreate event', error as Error);
		}
	},
};
