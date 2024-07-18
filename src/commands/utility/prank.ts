import { ShrimpCommand } from '../../common/base.js';
import { ApplicationCommandType, bold, ContextMenuCommandBuilder, EmbedBuilder, italic, SlashCommandBuilder } from 'discord.js';
import { sleep } from '../../common/utilityMethods.js';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		if (!interaction || !interaction.guild) {
			return;
		}

		const eyeEmoji = client.emojis.cache.get(`1262564931245441126`)?.toString() || '👁️';
		const embedColor = (await client.getGuildSettings(interaction.guild)).categories.general.settings.embedColor.value;
		const friend = interaction.isUserContextMenuCommand() ? interaction.targetMember : interaction.options.getMember('friend');

		const funnyLinks: string[] = [
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Never gonna give you up
			'https://www.youtube.com/watch?v=nwuW98yLsgY', // Shikanokokokokokoko
			'https://www.youtube.com/watch?v=Z3ZAGBL6UBA', // Peanut butter jelly time!
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Never gonna let you down
			'https://www.youtube.com/watch?v=y6120QOlsfU', // Darude - Sandstorm
			'https://www.youtube.com/watch?v=_S7WEVLbQ-Y', // 1 hour of shreksophone
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Never gonna run around and desert you
			'https://www.youtube.com/watch?v=ykAoLY9RMCo', // Top 5 walter white
			'https://www.youtube.com/watch?v=J---aiyznGQ', // Charlie Schmidt's Keyboard Cat! - THE ORIGINAL!
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Never gonna make you cry
			'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - GANGNAM STYLE(강남스타일) M/V
			'https://www.youtube.com/watch?v=Ct6BUPvE2sM', // PPAP (Pen-Pineapple-Apple-Pen)
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Never gonna say goodbye
			'https://www.youtube.com/watch?v=u4ecB57jFhI', // Shrimp
			'https://www.youtube.com/watch?v=PTFMGN8JHBw', // Fish
			'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Never gonna tell a lie and hurt you
		];

		if (!friend) {
			return;
		}

		const prankEmbed = new EmbedBuilder()
			.setColor(embedColor)
			.setTitle(`${bold(italic('FRIENDLY REMINDER'))}`)
			.setDescription(`Hey ${friend}, I just wanted to warn you that you're about to be pranked, be careful out there!`);

		try {
			await interaction.deferReply();

			await interaction.followUp({
				embeds: [prankEmbed],
			});

			const prankMessage = await interaction.channel?.send({
				content: `-# ${eyeEmoji} Only you can see this • [Dismiss message](<${funnyLinks[Math.floor(Math.random() * funnyLinks.length)]}>)`,
			});

			await sleep(20000);

			await interaction.editReply({
				embeds: [
					prankEmbed.setDescription(
						`Just kidding ${friend}, you're safe! This is a prank based on this [video](<https://www.youtube.com/watch?v=3C6GhF192aA>)`
					),
				],
			});

			await prankMessage?.delete(); // Delete to avoid notifying the user of an edit :)

			const prankMessageTwo = await interaction.channel?.send({
				content: `-# ${eyeEmoji} Only you can see this • [Click to get pranked](<${funnyLinks[Math.floor(Math.random() * funnyLinks.length)]}>)`,
			});

			await sleep(40000);
			if (interaction.isRepliable()) {
				await interaction.deleteReply();
			}

			if (prankMessageTwo?.deletable) {
				await prankMessageTwo?.delete();
			}
		} catch (error) {
			client.handleError('Prank command', error as Error);
		}
	},

	slash: new SlashCommandBuilder()
		.setName('prank')
		.setDescription('Prank your friends with a fake message.')
		.addUserOption((user) => user.setName('friend').setDescription('The friend to prank').setRequired(true)),

	context: new ContextMenuCommandBuilder().setName('prank').setType(ApplicationCommandType.User),
};
