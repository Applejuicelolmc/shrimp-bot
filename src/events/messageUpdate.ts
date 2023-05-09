import { BufferResolvable, Colors, EmbedBuilder, Events, Message, TextChannel, Webhook } from "discord.js";
import { ShrimpEvent } from "../common/base";
import GuildSettings from "../models/guildSettings";

export default {
	name: Events.MessageUpdate,
	once: false,
	async execute(client, oldMessage: Message, newMessage: Message) {
		const { errorLogger } = client;
		const currentGuild = await GuildSettings.findOne({ guildId: oldMessage.guildId });

		if (!oldMessage.guild || oldMessage.author.bot || !currentGuild) {
			return;
		};

		if (!currentGuild.logSettings.editWebhook || !currentGuild.logSettings.logChannel) {
			return;
		};

		const logDeletes = currentGuild.logSettings.logDeletes;
		const logChannel = client.channels.cache.get(currentGuild.logSettings.logChannel) as TextChannel;
		const editWebhook = await client.fetchWebhook(currentGuild.logSettings.editWebhook.id) as Webhook;
		//TODO handle error when the webhook is not found

		try {
			if (logDeletes && logChannel && editWebhook) {
				const logEmbed = new EmbedBuilder()
					.setTitle(`**${oldMessage.member?.user.username}#${oldMessage.member?.user.discriminator} in ${oldMessage.channel}**`)
					.setDescription(`**From:** \`\`\`${oldMessage.content == '' ? '\u200b' : oldMessage.content}\`\`\`\n**To:** \`\`\`${newMessage.content == '' ? '\u200b' : newMessage.content}\`\`\``)
					.setURL(newMessage.url)
					.setThumbnail(newMessage.author.avatarURL())
					.setColor(Colors.Blue)
					.setTimestamp()
					.setFooter({
						text: `Message ID: ${newMessage.id}`
					})

				if (oldMessage.attachments.size > 0) {
					const attachmentEmbeds: EmbedBuilder[] = [];
					const attachmentFiles: BufferResolvable[] = [];

					editWebhook.send({
						embeds: [
							logEmbed
						],
					});

					let count = 0

					for (const [messageID, attachment] of oldMessage.attachments) {
						count++

						attachmentEmbeds.push(
							new EmbedBuilder({
								title: `Attachement ${count}`,
								color: Colors.Red
							}).setImage(`attachment://${attachment.name}`)
						)

						attachmentFiles.push(attachment.proxyURL as BufferResolvable);
					}

					if (attachmentFiles.length > 1) {
						return editWebhook.send({
							files: attachmentFiles
						});
					}

					return editWebhook.send({
						embeds: attachmentEmbeds,
						files: attachmentFiles
					});


				}

				editWebhook.send({
					embeds: [
						logEmbed
					]
				})
			}
		} catch (error) {
			if (error instanceof Error) {
				errorLogger.error(`messageUpdate event: ${error.stack}`);
			} else {
				errorLogger.error(`messageUpdate event: ${error}`);
			}
		}
	}
} as ShrimpEvent