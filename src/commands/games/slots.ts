import {
	ActionRowBuilder,
	bold,
	ButtonBuilder,
	Colors,
	ComponentEmojiResolvable,
	ComponentType,
	EmbedBuilder,
	ImageURLOptions,
	italic,
	SlashCommandBuilder,
} from 'discord.js';
import { ShrimpCommand } from '../../common/base.js';
import { sleep } from '../../common/utilityMethods.js';

export default <ShrimpCommand>{
	async execute(client, interaction) {
		if (!interaction || !interaction.guild) {
			return;
		}

		// TODO: Add a scoring system
		//TODO: Refactor?

		const sevenEmote = client.emojis.cache.get(`1251601131562602536`)?.toString();
		const galactusEmote = client.emojis.cache.get(`1251601134213271636`)?.toString();
		const moonstoneEmote = client.emojis.cache.get(`1251601137250074806`)?.toString();
		const lighntingEmote = client.emojis.cache.get(`1251601135664631891`)?.toString();
		const berryEmote = client.emojis.cache.get(`1251601132770300036`)?.toString();
		const replayEmote = client.emojis.cache.get(`1251601138630000772`)?.toString();
		const empt = client.emojis.cache.get(`1250566002664800469`)?.toString() || '⬛';

		const slotEmoji = [sevenEmote || '🍒', galactusEmote || '🍇', moonstoneEmote || '🍊', lighntingEmote || '🍋', berryEmote || '🍉', replayEmote || '💮'];

		let totalSpins = 0;

		await interaction.deferReply({ ephemeral: true });

		// const baseSlot = [
		// 	['╔═', '═╦═', '\u200b', '═╦═', '═╗'],
		// 	['║', slotemoji[0], '║', slotemoji[0], '║', slotemoji[0], '║'],
		// 	['║', slotemoji[0], '║', slotemoji[0], '║', slotemoji[0], '║'],
		// 	['║', slotemoji[0], '║', slotemoji[0], '║', slotemoji[0], '║'],
		// 	['╚═', '═╩═', '\u200b', '═╩═', '═╝'],
		// ];

		const baseSlot = [
			[empt, slotEmoji[0], empt, slotEmoji[0], empt, slotEmoji[0], empt],
			[empt, slotEmoji[0], empt, slotEmoji[0], empt, slotEmoji[0], empt],
			[empt, slotEmoji[0], empt, slotEmoji[0], empt, slotEmoji[0], empt],
		];

		// const baseSlot = [
		// 	[slotEmoji[0], slotEmoji[0], slotEmoji[0]],
		// 	[slotEmoji[0], slotEmoji[0], slotEmoji[0]],
		// 	[slotEmoji[0], slotEmoji[0], slotEmoji[0]],
		// ];

		const spinDelay = 50;

		const imageOptions: ImageURLOptions = {
			size: 4096,
			forceStatic: false,
		};

		const embedColor = (await client.getGuildSettings(interaction.guild)).categories.general.settings.embedColor.value;

		const spinEmoji = ('1064993840773206060' as ComponentEmojiResolvable) || ('🔄' as ComponentEmojiResolvable);
		const stopEmoji = ('1104844190074011900' as ComponentEmojiResolvable) || ('⏹️' as ComponentEmojiResolvable);

		const gameButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([
			client.buttons.stop.setEmoji(stopEmoji).setDisabled(false),
			client.buttons.spin.setEmoji(spinEmoji).setDisabled(false),
		]);

		const slotsEmbed = new EmbedBuilder()
			.setTitle(bold(italic('SLOTS')))
			.setDescription(`# ${baseSlot.map((row) => row.join(' ')).join('\n# ')}`)
			.setColor(embedColor);

		function randomNumber(max: number, comparisonArrray: number[]) {
			const num = Math.floor(Math.random() * max);

			if (comparisonArrray.includes(num)) {
				return randomNumber(max, comparisonArrray);
			}

			comparisonArrray.push(num);
			return num;
		}

		async function spinSlots(collumn = 1) {
			await sleep(spinDelay);

			const comparisonArrray: number[] = [];

			baseSlot[0][collumn] = slotEmoji[randomNumber(slotEmoji.length, comparisonArrray)];
			baseSlot[1][collumn] = slotEmoji[randomNumber(slotEmoji.length, comparisonArrray)];
			baseSlot[2][collumn] = slotEmoji[randomNumber(slotEmoji.length, comparisonArrray)];

			slotsEmbed.data.description = `# ${baseSlot.map((row) => row.join(' ')).join('\n# ')}`;

			await interaction.editReply({ embeds: [slotsEmbed.setTitle(bold(italic('SLOTS - Spinning...')))], components: [] });

			if (collumn >= 5) {
				return;
			}

			await spinSlots(collumn + 2);
		}

		function deniedEmbed(text: string) {
			return new EmbedBuilder().setColor(Colors.Red).setDescription(`${client.customEmojis.get('981339000705024040')} ${text}`);
		}

		let buttonTimer = 30000;

		try {
			await interaction.editReply({ embeds: [slotsEmbed], components: [gameButtons] });

			const buttonCollector = (await interaction.fetchReply()).createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: buttonTimer,
			});

			buttonCollector.on('collect', async (button) => {
				await button.deferUpdate();

				if (button.user.id !== interaction.user.id) {
					await button.followUp({
						embeds: [deniedEmbed("You can't use this button...")],
						ephemeral: true,
					});

					return;
				}

				switch (button.customId) {
					case 'stop-button':
						await button.editReply({
							embeds: [
								slotsEmbed.setTitle(bold(italic('SLOTS - Bye nerd'))).setFooter({
									text: `Smell ya later ${interaction.user.displayName}!`,
									iconURL: client.user!.displayAvatarURL(imageOptions),
								}),
							],
							components: [],
						});

						return buttonCollector.stop('end');

					case 'spin-button':
						totalSpins++;

						for (let i = 0; i < 3; i++) {
							await spinSlots();
						}

						await interaction.editReply({
							embeds: [
								slotsEmbed
									.setTitle(bold(italic('SLOTS')))
									.setFooter({ iconURL: client.user!.displayAvatarURL(imageOptions), text: `Spins this session: ${totalSpins}` }),
							],
							components: [gameButtons],
						});
						buttonTimer = 30000;
				}
			});

			buttonCollector.on('end', async (_collected, reason) => {
				switch (reason) {
					case 'end':
						return;

					case 'time':
						await interaction.editReply({
							embeds: [
								slotsEmbed.setTitle(bold(italic('SLOTS - You took too long, bye ;)'))).setFooter({
									text: `Smell ya later ${interaction.user.displayName}!`,
									iconURL: client.user!.displayAvatarURL(imageOptions),
								}),
							],
							components: [],
						});
				}
			});
		} catch (error) {
			client.handleError(`[${interaction.guildId}] Slots command`, error as Error);
		}
	},
	slash: new SlashCommandBuilder().setName('slots').setDescription('Play a game of slots!'),
};
