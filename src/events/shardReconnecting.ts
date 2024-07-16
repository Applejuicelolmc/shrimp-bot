import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';

export default <ShrimpEvent>{
	name: Events.ShardReconnecting,
	once: false,
	async execute(client, args: any) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		try {
			client.infoLogger.info(`Shard reconnecting: ${args}`);
			client.setHealthStatus(true);
			return;
		} catch (error) {
			client.handleError('shardReconnecting event', error as Error);
		}
	},
};
