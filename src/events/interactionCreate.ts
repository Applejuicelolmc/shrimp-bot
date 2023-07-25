import { Events, Interaction } from 'discord.js';
import { ShrimpEvent } from '../common/base';

export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction: Interaction) {
		const { commands, infoLogger, errorLogger } = client;

		if (!interaction) {
			errorLogger.error(`Didn't receive interaction`);
		}

		if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
			const { commandName } = interaction;

			if (!commands.has(commandName)) {
				return;
			}

			const cmd = commands.get(commandName);

			if (!cmd) {
				return;
			}

			try {
				const startTime = performance.now();

				cmd?.execute(client, interaction);

				const endTime = performance.now();

				if (process.env.ENVIRONMENT === 'development') {
					infoLogger.info(
						`The ${interaction.commandName} command was executed by ${interaction.user.username} in ~${
							Math.round((endTime - startTime) * 100) / 100
						}ms`
					);
				}
			} catch (error) {
				if (error instanceof Error) {
					errorLogger.error(`Couldn't execute command: ${error.stack}`);
				} else {
					errorLogger.error(`Couldn't execute command: ${error}`);
				}

				await interaction.reply({
					content: `There was an error while executing this command! If this keeps happening please report this in my support server.\n\n***ERROR MESSAGE:***\n\`${error}\``,
					ephemeral: true,
				});
			}
		}
	},
};
