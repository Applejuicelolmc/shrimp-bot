import { BufferResolvable, Colors, EmbedBuilder, Events, Message, TextChannel, Webhook } from "discord.js";
import { ShrimpEvent } from "../common/base";
import GuildSettings from "../models/guildSettings";

export default {
	name: Events.MessageDelete,
	once: false,
	async execute(client, message: Message) {
		const { errorLogger } = client;
		const currentGuild = await GuildSettings.findOne({ guildId: message.guildId });

		if (!message.guild || message.author.bot || !currentGuild) {
			return;
		};

		if (!currentGuild.logSettings.deleteWebhook || !currentGuild.logSettings.logChannel) {
			return;
		};

		const logDeletes = currentGuild.logSettings.logDeletes;
		const logChannel = client.channels.cache.get(currentGuild.logSettings.logChannel) as TextChannel;
		const deleteWebhook = await client.fetchWebhook(currentGuild.logSettings.deleteWebhook.id) as Webhook;
		//TODO handle error when the webhook is not found

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
						text: `Message ID: ${message.id}`
					})

				if (message.attachments.size > 0) {
					const attachmentEmbeds: EmbedBuilder[] = [];
					const attachmentFiles: BufferResolvable[] = [];

					for (const [messageID, attachment] of message.attachments) {

						attachmentEmbeds.push(
							EmbedBuilder.from(logEmbed).setImage(`attachment://${attachment.name}`)
						)

						attachmentFiles.push(attachment.proxyURL as BufferResolvable);
					}

					return deleteWebhook.send({
						embeds: attachmentEmbeds,
						files: attachmentFiles
					});
				}

				deleteWebhook.send({
					embeds: [
						logEmbed
					]
				})
			}
		} catch (error) {
			if (error instanceof Error) {
				errorLogger.error(`messageDelete event: ${error.stack}`);
			} else {
				errorLogger.error(`messageDelete event: ${error}`);
			}
		}
	}
} as ShrimpEvent