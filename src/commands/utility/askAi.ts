import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ShrimpCommand } from '../../common/base';
import { Configuration, OpenAIApi } from 'openai';
import { env } from 'process';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		const { options } = interaction as ChatInputCommandInteraction;

		const configuration = new Configuration({
			apiKey: env.OPENAI_TOKEN,
		});

		const openai = new OpenAIApi(configuration);

		const input = options.getString('input');

		if (!input) {
			return;
		}

		try {
			await interaction.deferReply({
				ephemeral: false,
			});

			const response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'user',
						content: input,
					},
				],
			});
			await interaction.followUp({
				content: `***Input:***\n\`\`\`${input}\`\`\`\n***Output:***\n\`\`\`${response.data.choices[0].message?.content}\`\`\``,
			});
		} catch (error) {
			client.handleError('AskAi command', error as Error);
		}
	},

	slash: new SlashCommandBuilder()
		.setName('askai')
		.setDescription('Ask something to chatGPT.')
		.addStringOption((input) => input.setName('input').setDescription('your question').setRequired(true)),
};
