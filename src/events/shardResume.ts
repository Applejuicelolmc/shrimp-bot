import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.ts';

export default <ShrimpEvent>{
	name: Events.ShardResume,
	once: false,
	async execute(client, args: any) {
		if (!client.isReady() || !client.infoLogger) {
			return;
		}

		try {
			client.infoLogger.info(`Shard resumed: ${args}`);
			return; // TODO: Do something with this
		} catch (error) {
			client.handleError('shardResume event', error as Error);
		}
	},
};
