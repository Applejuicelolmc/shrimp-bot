import { EmbedBuilder, Message, SlashCommandBuilder } from "discord.js";
import { ShrimpCommand } from "../../common/base";

export default<ShrimpCommand> {
	async execute(client, interaction): Promise<void> {
		const { errorLogger } = client;

		const pingEmbed = new EmbedBuilder({
			title:`***PONG***`,
			color: 0xB00B69
		});

		try {
			await interaction.deferReply({
				ephemeral: true,
			});

			await interaction.followUp({
				embeds: [
					pingEmbed
				]
			});

			const msg: Message = await interaction.fetchReply();

			pingEmbed.addFields([
				{
					name: 'Bot Latency',
					value: `*${msg.createdTimestamp - interaction.createdTimestamp}ms*`
				},
				{
					name: 'Discord API Latency',
					value: `*${interaction.client.ws.ping}ms*`
				},
			]);

			await interaction.editReply({
				embeds: [
					pingEmbed.setTitle(`***LATENCY STATS***`)
				],
			});
		} catch (error) {
			if (error instanceof Error) {
				errorLogger.error(`Login: ${error.message}`);
			} else {
				errorLogger.error(`Login: ${error}`);
			}
		}
	}, 

	info: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Calculates current ping.')
}