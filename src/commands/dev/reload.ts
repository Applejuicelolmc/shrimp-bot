import { SlashCommandBuilder } from 'discord.js';
import { ShrimpCommand } from '../../common/base.js';
import { fetchCommands, loadCommands, resetCommands } from '../../handlers/commandHandler.js';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		try {
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
