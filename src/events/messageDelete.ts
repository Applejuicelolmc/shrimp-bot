import { ShrimpEvent } from '../common/base.js';
import { BufferResolvable, Colors, EmbedBuilder, Events, Message, TextChannel, Webhook } from 'discord.js';

export default <ShrimpEvent>{
	name: Events.MessageDelete,
	once: false,
	async execute(client, message: Message) {
		if (!message.guild || message.author.bot) {
			return;
		}

		const logSettings = (await client.getGuildSettings(message.guild)).categories.logging.settings;

		if (logSettings.deleteWebhook.value === 'none' || logSettings.logChannel.value === 'none') {
			return;
		}

		const logDeletes = logSettings.enabled;
		const logChannel = client.channels.cache.get(logSettings.logChannel.value.id) as TextChannel;
		const deleteWebhook = (await client.fetchWebhook(logSettings.deleteWebhook.value.id)) as Webhook;
		//TODO: handle error when the webhook is not found

		try {
			if (logDeletes && logChannel && deleteWebhook) {
				const logEmbed = new EmbedBuilder()
					.setTitle(`**${message.member?.user.username}#${message.member?.user.discriminator} in ${message.channel}**`)
					.setDescription(`**Message:**\n\`\`\`${message.content == '' ? '\u200b' : message.content}\`\`\``)
					.setURL(message.url)
					.setThumbnail(message.author.avatarURL())
					.setColor(Colors.Red)
					.setTimestamp()
					.setFooter({
						text: `Message ID: ${message.id}`,
					});

				if (message.attachments.size > 0) {
					const attachmentEmbeds: EmbedBuilder[] = [];
					const attachmentFiles: BufferResolvable[] = [];

					for (const [, attachment] of message.attachments) {
						attachmentEmbeds.push(EmbedBuilder.from(logEmbed).setImage(`attachment://${attachment.name}`));

						attachmentFiles.push(attachment.proxyURL as BufferResolvable);
					}

					return deleteWebhook.send({
						embeds: attachmentEmbeds,
						files: attachmentFiles,
					});
				}

				deleteWebhook.send({
					embeds: [logEmbed],
				});
			}
		} catch (error) {
			client.handleError('messageDelete event', error as Error);
		}
	},
};
