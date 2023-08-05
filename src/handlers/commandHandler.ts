import { readdir, stat } from 'fs/promises';
import { ShrimpCategory, ShrimpClient, ShrimpCommand } from '../common/base';
import { ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from 'discord.js';

const rest = new REST({
	version: '10',
}).setToken(process.env.DISCORD_TOKEN!);

export async function fetchCommands(client: ShrimpClient): Promise<(SlashCommandBuilder | ContextMenuCommandBuilder)[]> {
	const allCommands: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = [];
	const sortedCategories: ShrimpCategory[] = [];
	const commandFolder = await readdir(client.paths.commands);

	for (const category of commandFolder) {
		const stats = await stat(`${client.paths.commands}/${category}`);

		if (stats.isFile()) {
			continue; //ignore files when reading commands folder
		}

		const categoryFolder = await readdir(`${client.paths.commands}/${category}`);

		const commandFiles = categoryFolder.filter((file) => file.endsWith('.ts'));

		const { description, position, emoji } = await import(`${client.paths.commands}/${category}/info.json`);

		sortedCategories.push({
			name: category,
			info: {
				description: description,
				position: position,
				emoji: emoji,
				commandNames: [],
			},
		});

		for (const commandFile of commandFiles) {
			const command = (await import(`${client.paths.commands}/${category}/${commandFile}`)).default as ShrimpCommand;

			client.commands.set(command.slash.name, command);

			sortedCategories[sortedCategories.length - 1].info.commandNames.push(command.slash.name);

			allCommands.push(command.slash);

			if (command.context) {
				allCommands.push(command.context);
			}
		}
	}

	sortedCategories.sort((a, b) => {
		return a.info.position - b.info.position;
	});

	for (const category of sortedCategories) {
		client.categories.set(category.name, category);
	}

	return allCommands;
}

export async function loadCommands(client: ShrimpClient, commands: Promise<(SlashCommandBuilder | ContextMenuCommandBuilder)[]>): Promise<void> {
	const resolvedCommands: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = await commands;

	try {
		if (process.env.ENVIRONMENT === 'development') {
			// Register commands to dev server only
			try {
				await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!), {
					body: resolvedCommands,
				});

				client.infoLogger.info(`Registered ${resolvedCommands.length} commands to the dev server`);
			} catch (error) {
				client.handleError('Registering commands to the dev server', error as Error);
			}
		} else {
			// Register commands to all joined servers
			try {
				await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
					body: resolvedCommands,
				});

				client.infoLogger.info(`Registered ${resolvedCommands.length} commands globally`);
			} catch (error) {
				client.handleError('Registering commands globally', error as Error);
			}
		}
	} catch (error) {
		client.handleError('Registering commands', error as Error);
	}
}

export async function resetCommands(client: ShrimpClient): Promise<void> {
	try {
		client.infoLogger.info(`Resetting all commands...`);

		client.commands.clear();

		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
			body: [],
		});

		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!), {
			body: [],
		});

		client.infoLogger.info(`All commands have been reset!`);
	} catch (error) {
		client.handleError('Resetting commands', error as Error);
	}
}

export default async function commandHandler(client: ShrimpClient): Promise<void> {
	if (process.argv.includes('reset')) {
		try {
			await resetCommands(client);
		} catch (error) {
			client.handleError('Command handler', error as Error);
		}
	}

	const slashCommands = fetchCommands(client);

	if (process.argv.includes('deploy')) {
		try {
			await loadCommands(client, slashCommands);
		} catch (error) {
			client.handleError('Command handler', error as Error);
		}
	}
}
