import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ShrimpCommand } from '../../common/base';
import { testGuild, updateDB } from '../../handlers/mongoDBHandler.js';

export default <ShrimpCommand>{
	async execute(client, interaction: ChatInputCommandInteraction): Promise<void> {
		try {
			if (interaction.user.id !== '298054641705549844') {
				return;
			}

			await updateDB(testGuild, null, true);

			client.getGuildSettings;

			await interaction.reply({
				content: 'Test complete',
				ephemeral: true,
			});
		} catch (error) {
			client.handleError('testdb command', error as Error);
		}
	},

	slash: new SlashCommandBuilder().setName('testdb').setDescription('test database functions'),
};
