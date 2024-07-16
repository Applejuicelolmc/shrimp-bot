import { ActivityType, ChatInputCommandInteraction, ColorResolvable, Colors, GuildBasedChannel, SlashCommandBuilder } from 'discord.js';
import { ShrimpCommand } from '../../common/base.js';
import { fetchCommands, loadCommands, resetCommands } from '../../handlers/commandHandler.js';
import { emdedColorUpdateSetting, settingPaths, testGuild, updateDB } from '../../handlers/mongoDBHandler.js';

export default <ShrimpCommand>{
	async autocomplete(client, interaction) {
		const focusedValue = interaction.options.getFocused(true);
		let choices: string[] = [];

		console.log('focusedValue', focusedValue);

		const colors = {
			choices: Object.keys(Colors).map((color) => color),
			values: [],
		};

		const commands = {
			choices: client.commands.map((command) => command.slash.name),
			values: [],
		};

		const channels = {
			choices: interaction.guild?.channels.cache.map((channel) => channel.name) ?? [],
			values: [],
		};

		switch (focusedValue.name) {
			case 'embed-color':
				choices = colors.choices.length < 25 ? colors.choices : colors.choices.slice(0, 25);

				break;

			case 'disabled-commands':
				choices = commands.choices;

				break;

			case 'logging':
				choices = ['true', 'false'];

				break;

			case 'log-channel':
				choices = channels.choices.length < 25 ? channels.choices : channels.choices.slice(0, 25);

				break;

			default:
				choices = ['nuh uh'];
				break;
		}

		const filtered = choices.filter((choice) => choice.toLowerCase().includes(focusedValue.value));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},

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
					await updateDB(testGuild, settingPaths.embedColor, Colors.DarkOrange);

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
		.addSubcommand((subcommand) =>
			subcommand
				.setName('testdb')
				.setDescription('Test the database')
				.addStringOption((embedColor) => embedColor.setName('embed-color').setDescription('embed color').setAutocomplete(true))
				.addStringOption((disabledCommands) => disabledCommands.setName('disabled-commands').setDescription('disable commands').setAutocomplete(true))
				.addStringOption((logChannel) => logChannel.setName('log-channel').setDescription('logChannel').setAutocomplete(true))
		)
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
