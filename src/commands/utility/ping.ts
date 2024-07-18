import { ShrimpCommand } from '../../common/base.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		if (!interaction || !interaction.guild) {
			return;
		}

		const generalSettings = (await client.getGuildSettings(interaction.guild)).categories.general.settings;

		const pingEmbed = new EmbedBuilder().setTitle(`***PONG***`).setColor(generalSettings.embedColor.value).setThumbnail('attachment://ping-pong.gif');

		try {
			await interaction.deferReply({
				ephemeral: true,
			});

			await interaction.followUp({
				embeds: [pingEmbed],
				files: [client.gifs.pingpong],
			});

			const msg = await interaction.fetchReply();

			pingEmbed.addFields([
				{
					name: 'Bot Latency',
					value: `*${msg.createdTimestamp - interaction.createdTimestamp}ms*`,
				},
				{
					name: 'Discord API Latency',
					value: `*${interaction.client.ws.ping}ms*`,
				},
			]);

			await interaction.editReply({
				embeds: [pingEmbed.setTitle(`***LATENCY STATS***`)],
			});
		} catch (error) {
			client.handleError('Ping command', error as Error);
		}
	},

	slash: new SlashCommandBuilder().setName('ping').setDescription('Calculates current ping.'),
};
