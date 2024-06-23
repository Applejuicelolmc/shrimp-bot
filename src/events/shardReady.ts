import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';

export default <ShrimpEvent>{
	name: Events.ShardReady,
	once: false,
	async execute(client, args: any) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		try {
			client.infoLogger.info(`Shard ready: ${args}`);
			client.setHealthStatus(true);
			return; // TODO: Do something with this
		} catch (error) {
			client.handleError('shardReady event', error as Error);
		}
	},
};
