import { ActivityType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ShrimpCommand } from '../../common/base.js';
import { fetchCommands, loadCommands, resetCommands } from '../../handlers/commandHandler.js';
import { testGuild, updateDB } from '../../handlers/mongoDBHandler.js';

export default <ShrimpCommand>{
	async execute(client, interaction: ChatInputCommandInteraction): Promise<void> {
		if (interaction.isCommand()) {
			async function reload() {
				try {
					await interaction.deferReply({ ephemeral: true });

					await resetCommands(client);

					await loadCommands(client, await fetchCommands(client));

					await interaction.editReply('reloaded all commands!');
				} catch (error) {
					client.handleError('reload command', error as Error);
				}
			}

			async function testDB() {
				try {
					await updateDB(testGuild, null, true);

					client.getGuildSettings;

					await interaction.reply({
						content: 'Test complete',
						ephemeral: true,
					});
				} catch (error) {
					client.handleError('testdb command', error as Error);
				}
			}

			async function updatePresence(defaultPresence: boolean = false) {
				try {
					const title = interaction.options.getString('title');
					const type = interaction.options.getInteger('type');

					await interaction.deferReply({ ephemeral: true });

					if (defaultPresence) {
						client.user?.setPresence(client.defaultPresence);

						await interaction.editReply({
							content: 'Successfully reset presence!',
						});

						return;
					}

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
			}

			const subcommand = interaction.options.getSubcommand();

			switch (subcommand) {
				case 'reload':
					reload();
					break;
				case 'testdb':
					testDB();
					break;
				case 'presence':
					updatePresence();
					break;

				default:
					break;
			}
		}
	},

	slash: new SlashCommandBuilder()
		.setName('dev')
		.setDescription('Run developer commands (dev only)')
		.addSubcommand((subcommand) => subcommand.setName('reload').setDescription('Reload all commands'))
		.addSubcommand((subcommand) => subcommand.setName('testdb').setDescription('Test the database'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('presence')
				.setDescription('update bot presence')
				.addStringOption((title) => title.setName('title').setDescription('The title of the new presence').setRequired(true))
				.addIntegerOption((type) =>
					type
						.setName('type')
						.setDescription('the type of presence you want')
						.addChoices(
							{ name: 'Competing', value: ActivityType.Competing },
							{ name: 'Custom', value: ActivityType.Custom },
							{ name: 'Listening', value: ActivityType.Listening },
							{ name: 'Playing', value: ActivityType.Playing },
							{ name: 'Streaming', value: ActivityType.Streaming },
							{ name: 'Watching', value: ActivityType.Watching }
						)
				)
		),
};
