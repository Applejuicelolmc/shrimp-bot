import { SlashCommandBuilder } from 'discord.js';
import { ShrimpCommand } from '../../common/base.ts';
import { fetchCommands, loadCommands, resetCommands } from '../../handlers/commandHandler.ts';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		try {
			if (interaction.user.id !== '298054641705549844') {
				return;
			}

			await interaction.deferReply({ ephemeral: true });

			await resetCommands(client);

			await loadCommands(client, await fetchCommands(client));

			await interaction.editReply('reloaded all commands!');
		} catch (error) {
			client.handleError('reload command', error as Error);
		}
	},

	slash: new SlashCommandBuilder().setName('reload').setDescription('reload all commands'),
};
