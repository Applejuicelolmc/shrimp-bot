import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from 'discord.js';
import { ShrimpCommand } from '../../common/base.js';
import GuildSettings, {
	IBaseCategory,
	IBooleanSetting,
	IGuildSettingsSchema,
	ILogCategory,
	ILogSettings,
	ITextChannelSetting,
	IWebhookSetting,
} from '../../models/guildSettings.js';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		if (!interaction.guildId) {
			console.log('nuh uh');
			return;
		}
		// TODO merge this into config
		const { errorLogger } = client;
		const { options } = interaction as ChatInputCommandInteraction;

		const target = options.getChannel('channel') as TextChannel;
		const loggingEnabled = options.getBoolean('logging') as boolean;

		try {
			const messageEditedHook = await target.createWebhook({
				name: 'Message edited',
				avatar: 'src/assets/icons/edit.png',
			});

			const messageDeletedHook = await target.createWebhook({
				name: 'Message deleted',
				avatar: 'src/assets/icons/remove.png',
			});

			console.log('started updating guildsettings');
			//TODO THIS!
			const filter: Partial<IGuildSettingsSchema> = { 'guildId': interaction.guildId };
			const updatedSettings = {
				'logging': <Omit<ILogCategory, IBaseCategory['name'] | IBaseCategory['description']>>{
					'settings': <ILogSettings>{
						'logChannel': <ITextChannelSetting>{
							value: target,
						},
						'enabled': <IBooleanSetting>{
							value: loggingEnabled,
						},
						'editWebhook': <IWebhookSetting>{
							value: messageEditedHook,
						},
						'deleteWebhook': <IWebhookSetting>{
							value: messageDeletedHook,
						},
					},
				},
			};
			const updateSettings = await GuildSettings.updateOne(filter, {
				$set: updatedSettings,
			});

			console.log(updateSettings);

			console.log('done with updating guildsettings');
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
		.addChannelOption((channel) =>
			channel
				.setName('channel')
				.setDescription('The channel that should be used for sending logs to.')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		)
		.addBooleanOption((logging) => logging.setName('logging').setDescription('Enable logging messages to the set log channel').setRequired(true)),
};
