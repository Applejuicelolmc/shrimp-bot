import Mustache from 'mustache';
import { ShrimpClient, ShrimpCommand } from '../common/base';
import { capitalize } from '../common/utilityMethods';
import { EmojiResolvable } from 'discord.js';

export default async function MustacheHandler(client: ShrimpClient) {
	const mustacheTemplatePath = `${client.paths.common}/mustache-templates`;

	const mdTableHeaderString = '| Command | Aliases | Usage | Description |';
	const mdTableSeparatorString = '|:--------|---------|-------|-------------|';
	interface IMustacheData {
		category: string;
		position: number;
		description: string;
		emoji: EmojiResolvable;
		tableHeader: string;
		tableSeparator: string;
		commands: [string, ShrimpCommand][];
	}

	let completeData;
	let mustacheData: IMustacheData = {
		category: '',
		position: 0,
		description: '',
		emoji: '',
		tableHeader: '',
		tableSeparator: '',
		commands: [],
	};

	try {
		// TODO: Grow Moustache

		for (const category of client.categories) {
			const [, categoryInfo] = category;
			mustacheData = {
				category: capitalize(categoryInfo.name),
				position: categoryInfo.info.position,
				description: categoryInfo.info.description,
				emoji: categoryInfo.info.emoji,
				tableHeader: mdTableHeaderString,
				tableSeparator: mdTableSeparatorString,
				commands: [],
			};

			for (const command of client.commands) {
				mustacheData.commands.push(command);
			}
			console.log(category, mustacheData);
		}

		console.log('all', mustacheData);
	} catch (error) {
		client.handleError('MustacheHandler', error as Error);
	}
}
