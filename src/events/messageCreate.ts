import { Events, Message } from 'discord.js';
import { ShrimpEvent } from '../common/base';

export default <ShrimpEvent>{
	name: Events.MessageCreate,
	once: false,
	async execute(client, message: Message) {
		if (!message.guild || message.author.bot) {
			return;
		}

		// TODO Do something with this
	},
};
