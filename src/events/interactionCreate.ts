import { Colors, EmbedBuilder, Events, Interaction, bold } from 'discord.js';
import { ShrimpEvent } from '../common/base';

export default <ShrimpEvent>{
	name: Events.InteractionCreate,
	once: false,
	async execute(client, interaction: Interaction) {
		if (!interaction || !interaction.guild) {
			client.errorLogger.error(`Didn't receive interaction`);
		}

		if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
			const cmd = client.commands.get(interaction.commandName);

			if (!cmd) {
				return interaction.reply({
					content: 'This command is outdated, try again later',
					ephemeral: true,
				});
			}

			try {
				const startTime = performance.now();

				await cmd?.execute(client, interaction);

				const time = Math.round((performance.now() - startTime) * 100) / 100;

				if (process.env.ENVIRONMENT === 'development') {
					client.infoLogger.info(`${interaction.commandName} by ${interaction.user.displayName} (~${time}ms)`);

					await client.alertWebhook.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
								.addFields({
									name: `Interaction:`,
									value: `/${interaction.commandName} by ${interaction.user.displayName} (~${time}ms)`,
								})
								.setColor(Colors.Aqua),
						],
					});
				}
			} catch (error) {
				client.handleError(`Couldn't execute command`, error as Error);

				return await interaction.reply({
					content: `There was an error while executing this command! If this keeps happening please report this in my support server.\n\n***ERROR MESSAGE:***\n\`${error}\``,
					ephemeral: true,
				});
			}
		}
	},
};
