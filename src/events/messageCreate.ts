import { Events, Message } from 'discord.js';
import { ShrimpEvent } from '../common/base.ts';

export default <ShrimpEvent>{
	name: Events.MessageCreate,
	once: false,
	async execute(client, message: Message) {
		if (!message.guild || message.author.bot) {
			return;
		}

		try {
			return; // TODO: Do something with this, keep empty to not spam console with messages
		} catch (error) {
			client.handleError('messageCreate event', error as Error);
		}
	},
};
