import { ShrimpEvent } from '../common/base.js';
import { Colors, EmbedBuilder, Events, Interaction, bold } from 'discord.js';

export default <ShrimpEvent>{
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction: Interaction) {
		if (!interaction || !interaction.guild) {
			return client.errorLogger.error(`Didn't receive interaction`);
		}

		if (interaction.isAutocomplete()) {
			const cmd = client.commands.get(interaction.commandName);
			const devCmd = client.devCommands.get(interaction.commandName);

			if (!cmd && !devCmd) {
				return;
			}

			if (devCmd && interaction.user.id !== process.env.DEV_ID) {
				return;
			}

			try {
				const startTime = process.hrtime();

				if (cmd) {
					await cmd.autocomplete?.(client, interaction);
				}

				if (devCmd && interaction.user.id === process.env.DEV_ID) {
					await devCmd.autocomplete?.(client, interaction);
				}

				const totalTime = process.hrtime(startTime);

				if (process.env.ENVIRONMENT === 'development') {
					client.infoLogger.info(`${interaction.commandName} by ${interaction.user.displayName} (~${totalTime[1] / 1000000}ms)`);
				}
			} catch (error) {
				client.handleError(`Couldn't autocomplete command`, error as Error);
			}
		}

		if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
			const cmd = client.commands.get(interaction.commandName);
			const devCmd = client.devCommands.get(interaction.commandName);

			if (!cmd && !devCmd) {
				return interaction.reply({
					content: 'This command is not loaded for now, try again later',
					ephemeral: true,
				});
			}

			if (devCmd && interaction.user.id !== process.env.DEV_ID) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('Error')
							.setColor(Colors.Red)
							.setDescription(`You don't have permission to use this command!`)
							.setImage('attachment://who-you.gif'),
					],
					files: [client.gifs.whoyou],
					ephemeral: true,
				});
			}

			try {
				const startTime = process.hrtime();

				if (cmd) {
					await cmd.execute(client, interaction);
				}

				if (devCmd && interaction.user.id === process.env.DEV_ID) {
					await devCmd.execute(client, interaction);
				}

				const totalTime = process.hrtime(startTime);

				if (process.env.ENVIRONMENT === 'development') {
					client.infoLogger.info(`${interaction.commandName} by ${interaction.user.displayName} (~${totalTime[1] / 1000000}ms)`);
				}
			} catch (error) {
				client.handleError(`Couldn't execute command`, error as Error);

				if (interaction.deferred || interaction.replied) {
					return await interaction.followUp({
						content: `There was an error while executing this command! If this keeps happening please report this in my support server.\n\n***ERROR MESSAGE:***\n\`${error}\``,
						ephemeral: true,
					});
				} else if (interaction.isRepliable()) {
					return await interaction.reply({
						content: `There was an error while executing this command! If this keeps happening please report this in my support server.\n\n***ERROR MESSAGE:***\n\`${error}\``,
						ephemeral: true,
					});
				}
			}
		}
	},
};
