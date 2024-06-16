import { readdir, stat } from 'fs/promises';
import { ShrimpCategory, ShrimpClient, ShrimpCommand } from '../common/base.js';
import { ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from 'discord.js';
import commandMDGenerator from './commandMDHandler.js';

const rest = new REST({
	version: '10',
}).setToken(process.env.DISCORD_TOKEN!);

type categoryInfo = {
	'description': string;
	'position': number;
	'emoji': string;
};

type mixedCommands = (SlashCommandBuilder | ContextMenuCommandBuilder)[];

export async function fetchCommands(client: ShrimpClient): Promise<[mixedCommands, mixedCommands]> {
	const mainCommands: mixedCommands = [];
	const devCommands: mixedCommands = [];
	const sortedCategories: ShrimpCategory[] = [];
	const commandFolder = await readdir(client.paths.commands);

	for (const category of commandFolder) {
		const stats = await stat(`${client.paths.commands}/${category}`);

		if (stats.isFile()) {
			continue;
		}

		const categoryFolder = await readdir(`${client.paths.commands}/${category}`);

		const commandFiles = categoryFolder.filter((file) => file.endsWith('.ts'));

		const { description, position, emoji } = (await import(`${client.paths.commands}/${category}/info.json`, { assert: { type: 'json' } }))
			.default as categoryInfo; // why do you do this linter :(

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

			if (category === 'dev') {
				devCommands.push(command.slash);

				if (command.context) {
					devCommands.push(command.context);
				}
			} else {
				mainCommands.push(command.slash);

				if (command.context) {
					mainCommands.push(command.context);
				}
			}
		}
	}

	sortedCategories.sort((a, b) => {
		return a.info.position - b.info.position;
	});

	for (const category of sortedCategories) {
		client.categories.set(category.name, category);
	}

	client.infoLogger.info('Commands are ready');

	return [mainCommands, devCommands];
}

export async function loadCommands(client: ShrimpClient, commands: [mixedCommands, mixedCommands]): Promise<void> {
	const mainCommands = commands[0];
	const devCommands = commands[1];

	try {
		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.DEV_GUILD_ID!), {
			body: devCommands, // Register dev commands to dev server only
		});

		client.infoLogger.info(`Registered ${devCommands.length} commands to the dev server`);

		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
			body: mainCommands, // Register main commands to all joined servers
		});

		client.infoLogger.info(`Registered ${mainCommands.length} commands globally`);
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
	const commands = await fetchCommands(client);

	if (process.argv.includes('reset')) {
		await resetCommands(client);
		await loadCommands(client, commands);
	}

	if (process.argv.includes('deploy')) {
		await loadCommands(client, commands);
	}

	if (process.argv.includes('genenerate-md')) {
		await commandMDGenerator(client);
	}

	client.user?.setPresence(client.defaultPresence);
}
