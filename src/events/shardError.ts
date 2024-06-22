import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';

export default <ShrimpEvent>{
	name: Events.ShardError,
	once: false,
	async execute(client, args: any) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		try {
			client.infoLogger.info(`Shard error: ${args}`);
			return; // TODO: Do something with this
		} catch (error) {
			client.handleError('shardError event', error as Error);
		}
	},
};
