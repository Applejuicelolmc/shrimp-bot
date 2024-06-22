import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';

export default <ShrimpEvent>{
	name: Events.GuildAvailable,
	once: false,
	async execute(client, args: any) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		try {
			client.infoLogger.info(`Guild Available: ${args}`);
			return; // TODO: Do something with this
		} catch (error) {
			client.handleError('guildAvailable event', error as Error);
		}
	},
};
