import {
	ActionRowBuilder,
	ButtonBuilder,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	bold,
	codeBlock,
	italic,
} from 'discord.js';
import { ShrimpCommand } from '../../common/base';
import { Settings } from '../../models/guildSettings';
import { capitalize, sleep } from '../../common/utilityMethods';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		if (!interaction.guild) {
			return;
		}

		const guildSettings = await client.getGuildSettings(interaction.guild);

		const homeEmbed = new EmbedBuilder()
			.setTitle(`***BOT CONFIGURATION***`)
			.setColor(guildSettings.categories.general.settings.embedColor.value)
			.setDescription('View/edit the bot configuration for this server')
			.setFooter({
				text: `Select a category from the menu below.`,
			});

		type page = {
			value: string;
			embed: EmbedBuilder;
		};

		const pages: page[] = [];
		const menuOptions: StringSelectMenuOptionBuilder[] = [];
		const settingOptions: StringSelectMenuOptionBuilder[] = [];

		for (const [, category] of Object.entries(guildSettings.categories)) {
			const settingEmbed = EmbedBuilder.from(homeEmbed).setTitle(`***BOT CONFIGURATION - ${category.name.toUpperCase()}***`);

			menuOptions.push(
				new StringSelectMenuOptionBuilder()
					.setLabel(`${category.name}`)
					.setDescription(`${category.description}`)
					.setValue(`${category.name.toLowerCase()}`)
			);

			for (const [, setting] of Object.entries(category.settings) as [string, Settings][]) {
				settingEmbed.addFields({
					name: `${bold(`${setting.fullName.toUpperCase()}:`)}`,
					value: `${italic(setting.description)}\n${codeBlock(`${setting.value}`)}`,
				});

				settingOptions.push(
					new StringSelectMenuOptionBuilder()
						.setLabel(`${capitalize(setting.fullName)}`)
						.setDescription(`${setting.description}`)
						.setValue(`${setting.fullName.toLowerCase()}`)
				);
			}

			pages.push({
				value: `${category.name.toLowerCase()}`,
				embed: settingEmbed,
			});
		}

		const menu = new StringSelectMenuBuilder().setCustomId('category').setPlaceholder('Select a category!').addOptions(menuOptions);
		const settingMenu = new StringSelectMenuBuilder().setCustomId('setting').setPlaceholder('Select a setting!').addOptions(settingOptions);

		const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
		const settingRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(settingMenu);
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(client.buttons.home, client.buttons.edit.setDisabled(true));

		let timeLimit = 15 * 60 * 1000;

		try {
			if (!interaction) {
				return;
			}

			await interaction.reply({
				embeds: [homeEmbed],
				components: [menuRow, buttonRow],
				ephemeral: true,
			});

			let LastEmbed = homeEmbed;

			const categoryMenuMessage = await interaction.fetchReply();

			const categoryMenuCollector = categoryMenuMessage.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
				time: timeLimit,
			});

			categoryMenuCollector.on('collect', async (category) => {
				if (!category) {
					return;
				}

				await category.deferUpdate();

				const buttonCollector = categoryMenuMessage.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: timeLimit,
				});

				buttonCollector.on('collect', async (button) => {
					if (!button) {
						return;
					}

					await button.deferUpdate();

					await button.editReply({
						embeds: [LastEmbed],
						components: [button.message.components[0], button.message.components[1], settingRow],
					});
				});

				pages.forEach((page) => {
					if (page.value === category.values[0]) {
						LastEmbed = page.embed;

						category.editReply({
							embeds: [
								LastEmbed.setFooter({
									text: LastEmbed.data.footer!.text,
								}),
							],

							components: [
								categoryMenuMessage.components[0],
								new ActionRowBuilder<ButtonBuilder>().addComponents(buttonRow.components[0], buttonRow.components[1].setDisabled(false)),
							],
						});
					}
				});
			});

			categoryMenuCollector.on('end', async (_collected, reason) => {
				if (reason === 'time') {
					if (!interaction) {
						return;
					}

					await interaction.editReply({
						embeds: [
							LastEmbed.setFooter({
								text: `This interaction has expired`,
							}),
						],
						components: [],
					});
				}
			});

			while (timeLimit >= 1) {
				if (!interaction) {
					return;
				}

				await interaction.editReply({
					embeds: [
						LastEmbed.setFooter({
							text: `Select a category from the menu below. (${timeLimit / 60000} minutes remaining)`,
						}),
					],
				});

				await sleep(60000);

				timeLimit -= 60000;
			}
		} catch (error) {
			client.handleError('Config command', error as Error);
		}
	},

	slash: new SlashCommandBuilder().setName('config').setDescription('View/edit the bot configuration for this server'),
};
