import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';

export default <ShrimpEvent>{
	name: Events.Debug,
	once: false,
	async execute(client, debugMessage: string) {
		const { debugLogger } = client;

		if (debugMessage.includes('Heartbeat acknowledged')) {
			return; // Ignore Heartbeat related debug messages as they are useless for now
		}

		const messageArray = debugMessage.split(/\n/g); // Split message on each new line

		for (const message of messageArray) {
			debugLogger.info(`${message}`);
		}
	},
};
