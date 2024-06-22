import { ShrimpEvent } from '../common/base.js';
import { BufferResolvable, Colors, EmbedBuilder, Events, Message, TextChannel, Webhook } from 'discord.js';

export default <ShrimpEvent>{
	name: Events.MessageUpdate,
	once: false,
	async execute(client, oldMessage: Message, newMessage: Message) {
		if (!oldMessage.guild || oldMessage.author.bot) {
			return;
		}

		const logSettings = (await client.getGuildSettings(oldMessage.guild)).categories.logging.settings;

		if (logSettings.editWebhook.value === 'none' || logSettings.logChannel.value === 'none') {
			return;
		}

		const logEdits = logSettings.enabled;
		const logChannel = client.channels.cache.get(logSettings.logChannel.value.id) as TextChannel;
		const editWebhook = (await client.fetchWebhook(logSettings.editWebhook.value.id)) as Webhook;
		//TODO: handle error when the webhook is not found

		try {
			if (logEdits && logChannel && editWebhook) {
				const logEmbed = new EmbedBuilder()
					.setTitle(`**${oldMessage.member?.user.username}#${oldMessage.member?.user.discriminator} in ${oldMessage.channel}**`)
					.setDescription(
						`**From:** \`\`\`${oldMessage.content == '' ? '\u200b' : oldMessage.content}\`\`\`\n**To:** \`\`\`${
							newMessage.content == '' ? '\u200b' : newMessage.content
						}\`\`\``
					)
					.setURL(newMessage.url)
					.setThumbnail(newMessage.author.avatarURL())
					.setColor(Colors.Blue)
					.setTimestamp()
					.setFooter({
						text: `Message ID: ${newMessage.id}`,
					});

				if (oldMessage.attachments.size > 0) {
					const attachmentEmbeds: EmbedBuilder[] = [];
					const attachmentFiles: BufferResolvable[] = [];

					editWebhook.send({
						embeds: [logEmbed],
					});

					let count = 0;

					for (const [, attachment] of oldMessage.attachments) {
						count++;

						attachmentEmbeds.push(
							new EmbedBuilder({
								title: `Attachement ${count}`,
								color: Colors.Red,
							}).setImage(`attachment://${attachment.name}`)
						);

						attachmentFiles.push(attachment.proxyURL as BufferResolvable);
					}

					if (attachmentFiles.length > 1) {
						return editWebhook.send({
							files: attachmentFiles,
						});
					}

					return editWebhook.send({
						embeds: attachmentEmbeds,
						files: attachmentFiles,
					});
				}

				editWebhook.send({
					embeds: [logEmbed],
				});
			}
		} catch (error) {
			client.handleError('messageUpdate event', error as Error);
		}
	},
};
