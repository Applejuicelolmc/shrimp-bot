import { ShrimpCommand } from '../../common/base.ts';
import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const pongGif = new AttachmentBuilder('src/assets/gifs/ping-pong.gif', {
	name: 'ping-pong.gif',
});

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		if (!interaction.guild) {
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
				files: [pongGif],
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
