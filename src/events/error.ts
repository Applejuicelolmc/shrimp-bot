import { Events } from 'discord.js';
import { ShrimpEvent } from '../common/base.js';

export default <ShrimpEvent>{
	name: Events.Error,
	once: false,
	async execute(client, discordError: Error) {
		try {
			client.handleError('error event', discordError);
		} catch (error) {
			console.log('fuck', error);
		}
	},
};
