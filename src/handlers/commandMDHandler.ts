import Mustache from 'mustache';
import { EmojiResolvable } from 'discord.js';
import { ShrimpClient } from '../common/base.js';
import { capitalize } from '../common/utilityMethods.js';
import { appendFile, readFile, writeFile } from 'fs/promises';

export default async function commandMDGenerator(client: ShrimpClient) {
	const mustacheTemplatePath = `src/common/command.mustache`;

	const mdTableHeaderString = '| Command | Description |'; // TODO: Implement options ( Option Name | Option Description | Option Type | Required |)
	const mdTableSeparatorString = '|:--------|-------------|'; // TODO: Implement options (-------------|--------------------|-------------|----------|)
	interface IMustacheData {
		category: string;
		position: number;
		description: string;
		emoji: EmojiResolvable;
		tableHeader: string;
		tableSeparator: string;
		commands: string[];
	}

	try {
		await writeFile(`./readme/commands.md`, '# Command List', { flag: 'w' });
		await appendFile('./readme/commands.md', '\n');

		const start = process.hrtime();

		for await (const [, categoryInfo] of client.categories) {
			const mustacheData: IMustacheData = {
				category: capitalize(categoryInfo.name),
				position: categoryInfo.info.position,
				description: categoryInfo.info.description,
				emoji: categoryInfo.info.emoji,
				tableHeader: mdTableHeaderString,
				tableSeparator: mdTableSeparatorString,
				commands: [],
			};

			for await (const command of client.commands) {
				if (!categoryInfo.info.commandNames.includes(command[0])) {
					continue;
				}

				const dataString = `| ${command[1].slash.name} | ${command[1].slash.description} |`;

				// TODO: Implement options, for later :)

				// if (command[1].slash.options) {
				//
				// 	if (command[1].slash.options.length > 1) {
				// 		dataString += `| | | |`;
				// 	}

				// 	for (const option of command[1].slash.options) {
				// 		const optionObject = option.toJSON();
				// 		dataString += ` ${optionObject.name} | ${optionObject.description} | ${optionObject.type} | ${optionObject.required ? 'Yes' : 'No'}`;

				// 		if (command[1].slash.options.length <= 2) {
				// 			dataString = `| | |`;
				// 		}
				// 	}
				// }

				mustacheData.commands.push(dataString);
			}

			const data = await readFile(mustacheTemplatePath);

			await appendFile('./readme/commands.md', Mustache.render(data.toString(), mustacheData));
		}

		await appendFile('./readme/commands.md', '\n');

		await appendFile('./readme/commands.md', '[Back to readme](https://github.com/Applejuicelolmc/shrimp-bot?tab=readme-ov-file#commands)\n');

		const totalSeconds = process.hrtime(start);

		client.infoLogger.info(`Updated command list (~ ${totalSeconds[1] / 1000000} ms)`);
	} catch (error) {
		client.handleError('Command.md Generator', error as Error);
	}
}
