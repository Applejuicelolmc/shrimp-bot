import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { ShrimpCommand } from "../../common/base";
import GuildSettings, { IGuildSettingsSchema } from "../../models/guildSettings";

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		const { errorLogger } = client;
		const { options } = interaction as ChatInputCommandInteraction;

		const target = options.getChannel('channel') as TextChannel;
		const logging = options.getBoolean('logging') as Boolean;

		try {
			const messageEditedHook = await target.createWebhook({
				name: 'Message edited',
				avatar: 'src/assets/icons/edit.png'
			})

			const messageDeletedHook = await target.createWebhook({
				name: 'Message deleted',
				avatar: 'src/assets/icons/remove.png'
			})

			await GuildSettings.updateOne(<IGuildSettingsSchema>{ guildId: interaction.guildId }, {
				$set: {
					'logSettings.logChannel': target,
					'logSettings.editWebhook': messageEditedHook,
					'logSettings.deleteWebhook': messageDeletedHook,
					'logSettings.logDeletes': logging
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				errorLogger.error(`Setting command: ${error.stack}`);
			} else {
				errorLogger.error(`Setting command: ${error}`);
			}
		}
	},

	slash: new SlashCommandBuilder()
		.setName('setlogchannel')
		.setDescription('Set log channel')
		.addChannelOption(channel =>
			channel.setName('channel')
				.setDescription('The channel that should be used for sending logs to.')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		)
		.addBooleanOption(logging =>
			logging.setName('logging')
				.setDescription('Enable logging messages to the set log channel')
				.setRequired(true)
		)
}