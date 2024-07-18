import { env } from 'process';
import { ShrimpCommand } from '../../common/base.js';
import { bold, EmbedBuilder, italic, SlashCommandBuilder } from 'discord.js';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		if (!interaction || !interaction.guild) {
			return;
		}
		// TODO: Add more information
		const embedColor = (await client.getGuildSettings(interaction.guild)).categories.general.settings.embedColor.value;
		const githubEmoji = client.emojis.cache.get('1262636941552255008')?.toString() || '🐙';
		const dockerEmoji = client.emojis.cache.get('1262640061250404464')?.toString() || '🐳';

		const totalCachedGuilds = client.guilds.cache.size;
		const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

		const infoEmbed = new EmbedBuilder()
			.setColor(embedColor)
			.setThumbnail(client.user?.displayAvatarURL(client.imageOptions) as string)
			.setTitle(bold(italic(`INFO`)))
			.setDescription(`-# Some random information about my bot, `)
			.addFields(
				{
					name: `Up since:`,
					value: `<t:${client.startDateTime}:R>`,
					inline: true,
				},
				{
					name: `Total cached guilds:`,
					value: `\`\`\`${totalCachedGuilds}\`\`\``,
					inline: true,
				},
				{
					name: `Total users:`,
					value: `\`\`\`${totalUsers}\`\`\``,
					inline: true,
				},
				{
					name: `Usable Emoji:`,
					value: `\`\`\`${client.emojis.cache.size}\`\`\``,
					inline: true,
				},
				{
					name: `User commands:`,
					value: `\`\`\`${client.commands.size}\`\`\``,
					inline: true,
				},
				{
					name: `Dev commands:`,
					value: `\`\`\`${client.devCommands.size}\`\`\``,
					inline: true,
				},
				{
					name: `Source code:`,
					value: `${githubEmoji} [Github](<https://github.com/Applejuicelolmc/shrimp-bot>) \u200b • \u200b ${dockerEmoji} [Dockerhub](<https://hub.docker.com/repository/docker/applejuicelolmc/shrimp-bot/general>)`,
				}
			)
			.setFooter({
				text: `Developed by ${client.users.cache.get(env.DEV_ID)?.globalName}`,
				iconURL: client.users.cache.get(env.DEV_ID)?.displayAvatarURL(),
			});

		try {
			await interaction.deferReply({ ephemeral: true });

			await interaction.followUp({
				embeds: [infoEmbed],
			});
		} catch (error) {
			client.handleError('Info command', error as Error);
		}
	},

	slash: new SlashCommandBuilder().setName('info').setDescription('Shows some info about the bot'),
};
