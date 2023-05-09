import { readdir, stat } from "fs/promises";
import { ShrimpCategory, ShrimpClient, ShrimpCommand } from "../common/base";
import { ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from "discord.js";

export default async function commandHandler(client: ShrimpClient): Promise<void> {
	const { commands, categories, infoLogger, errorLogger, paths } = client;

	const rest = new REST({
		version: '10'
	})
		.setToken(process.env.DISCORD_TOKEN!);

	async function fetchCommands(): Promise<(SlashCommandBuilder | ContextMenuCommandBuilder)[]> {
		const allCommands: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = [];
		const sortedCategories: ShrimpCategory[] = [];
		const commandFolder = await readdir(paths.commands);

		for (const category of commandFolder) {
			const stats = await stat(`${paths.commands}/${category}`);

			if (stats.isFile()) {
				continue; //ignore files when reading commands folder
			}

			const categoryFolder = await readdir(`${paths.commands}/${category}`);

			const commandFiles = categoryFolder.filter(file => file.endsWith('.ts'));

			const { description, position, emoji } = require(`${paths.commands}/${category}/info.json`);

			sortedCategories.push({
				name: category,
				info: {
					description: description,
					position: position,
					emoji: emoji,
					commandNames: [],
				}
			});

			for (const commandFile of commandFiles) {
				const command = require(`${paths.commands}/${category}/${commandFile}`).default as ShrimpCommand;

				commands.set(command.slash.name, command);

				sortedCategories[sortedCategories.length - 1].info.commandNames.push(command.slash.name);

				allCommands.push(command.slash);

				if (command.context) {
					allCommands.push(command.context)
				}
			}
		}

		sortedCategories.sort((a, b) => {
			return a.info.position - b.info.position;
		});

		for (const category of sortedCategories) {
			categories.set(category.name, category);
		}

		return allCommands;
	}

	async function loadCommands(commands: Promise<(SlashCommandBuilder | ContextMenuCommandBuilder)[]>): Promise<void> {
		const resolvedCommands: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = await commands;

		try {
			if (process.env.ENVIRONMENT = 'development') {
				// Register commands to dev server only
				await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!), {
					body: resolvedCommands
				});

				infoLogger.info(`Registered ${resolvedCommands.length} commands to the dev server`);
			} else {
				// Register commands to all joined servers
				await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
					body: resolvedCommands
				});

				infoLogger.info(`Registered ${resolvedCommands.length} commands globally`);
			}

		} catch (error) {
			if (error instanceof Error) {
				errorLogger.error(`Failed to register commands: ${error.stack}`);
			} else {
				errorLogger.error(`Failed to register commands: ${error}`);
			}
		}
	}

	async function resetCommands(): Promise<void> {
		try {
			infoLogger.info(`Resetting all commands...`);

			await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
				body: []
			});

			await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!), {
				body: []
			});

			infoLogger.info(`All commands have been reset!`);

		} catch (error) {
			if (error instanceof Error) {
				errorLogger.error(`Failed to reset commands: ${error.stack}`);
			} else {
				errorLogger.error(`Failed to reset commands: ${error}`);
			}
		}
	}

	if (process.argv.includes('reset')) {
		await resetCommands();
	}

	try {
		loadCommands(fetchCommands());
	} catch (error) {
		if (error instanceof Error) {
			errorLogger.error(`Command handler: ${error.stack}`);
		} else {
			errorLogger.error(`Command handler: ${error}`);
		}
	}
}
