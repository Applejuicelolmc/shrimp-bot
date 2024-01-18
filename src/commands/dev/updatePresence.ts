import { ActivityType, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ShrimpCommand } from '../../common/base';

export default <ShrimpCommand>{
	async execute(client, interaction: ChatInputCommandInteraction): Promise<void> {
		try {
			if (interaction.user.id !== '298054641705549844') {
				return;
			}

			const title = interaction.options.getString('title');
			const type = interaction.options.getInteger('type');

			await interaction.deferReply({ ephemeral: true });

			client.user?.setPresence({
				status: 'idle',
				afk: false,
				activities: [
					{
						name: `${title}`,
						type: type as ActivityType,
					},
				],
			});

			await interaction.editReply({
				content: 'Successfully updated presence!',
			});
		} catch (error) {
			client.handleError('presence command', error as Error);
		}
	},

	slash: new SlashCommandBuilder()
		.setName('presence')
		.setDescription('update bot presence')
		.addStringOption((title) => title.setName('title').setDescription('The title of the new presence').setRequired(true))
		.addIntegerOption((type) =>
			type.setName('type').setDescription('the type of presence you want').addChoices(
				{
					name: 'Competing',
					value: ActivityType.Competing,
				},
				{
					name: 'Custom',
					value: ActivityType.Custom,
				},
				{
					name: 'Listening',
					value: ActivityType.Listening,
				},
				{
					name: 'Playing',
					value: ActivityType.Playing,
				},
				{
					name: 'Streaming',
					value: ActivityType.Streaming,
				},
				{
					name: 'Watching',
					value: ActivityType.Watching,
				}
			)
		),
};
