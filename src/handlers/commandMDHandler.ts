import Mustache from 'mustache';
import { EmojiResolvable } from 'discord.js';
import { ShrimpClient } from '../common/base.js';
import { capitalize } from '../common/utilityMethods.js';
import { appendFile, readFile, writeFile } from 'fs/promises';

export default async function commandMDGenerator(client: ShrimpClient) {
	const mustacheTemplatePath = `src/common/command.mustache`;

	const mdTableHeaderString = '| Command | Subcommand | Description |'; // TODO: Implement options ( Option Name | Option Description | Option Type | Required |)
	const mdTableSeparatorString = '|:--------|------------|-------------|'; // TODO: Implement options (-------------|--------------------|-------------|----------|)
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

			for await (const [name, command] of client.commands) {
				if (!categoryInfo.info.commandNames.includes(name)) {
					continue;
				}

				let dataString = `| ${command.slash.name} | | ${command.slash.description} |`;

				mustacheData.commands.push(dataString);

				for (let option of command.slash.options) {
					if (option.hasOwnProperty('options')) {
						// Only subcommands have options, until discord.js updates. See you until then ;)
						const subName = option.toJSON().name;
						const subDescription = option.toJSON().description;

						dataString = `| ${command.slash.name} | ${subName} | ${subDescription} |`;

						mustacheData.commands.push(dataString);
					}
				}
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
