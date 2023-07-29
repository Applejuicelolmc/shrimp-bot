import { ChannelType, ChatInputCommandInteraction, DateResolvable, EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import { ShrimpCommand } from '../../common/base';
import Parser from 'rss-parser';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		const { handleError } = client;
		const { options } = interaction as ChatInputCommandInteraction;

		interface RSS {
			title: string;
			link: string;
			pubDate: DateResolvable;
			author: string;
			content?: string;
			contentSnippet?: string;
			id: string;
			isoDate: DateResolvable;
		}

		process.env.

		// interface FeedData {
		// 	feed: RSS[]
		// 	destination: string
		// }

		if (options.getSubcommand() === 'create') {
			const url = options.getString('url') as string;
			const feedChannel = options.getChannel('channel') as TextChannel;

			const parser = new Parser();

			try {
				const feed = (await parser.parseURL(url)).items[0] as RSS;

				const feedEmbed = new EmbedBuilder({
					title: `***${feed.title}***`,
					url: feed.link,
					description: feed.link,
				});

				feedChannel.send({
					embeds: [feedEmbed],
				});

				setInterval(async () => {
					feedChannel.send({
						embeds: [feedEmbed],
					});
				}, 30000);
			} catch (error) {
				handleError('Feed command', error as Error);
			}
		}
	},

	slash: new SlashCommandBuilder()
		.setName('feed')
		.setDescription('Create or manage an rss feed.')
		.addSubcommand((create) =>
			create
				.setName('create')
				.setDescription('Create an rss feed for the provided channel.')
				.addStringOption((url) =>
					url.setName('url').setDescription('url of the rss feed you want to add, for example: https://www.reddit.com/r/aww/.rss').setRequired(true)
				)
				.addChannelOption((channel) =>
					channel
						.setName('channel')
						.setDescription('The channel that should be used for sending messages to.')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
		)
		.addSubcommand((manage) => manage.setName('manage').setDescription('Manage the rss feeds created with this bot.')),
};
