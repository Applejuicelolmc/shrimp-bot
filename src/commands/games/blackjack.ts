import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	GuildMember,
	SlashCommandBuilder,
	UserContextMenuCommandInteraction,
	bold,
	italic,
} from 'discord.js';
import { generateDeck, shuffleArray } from '../../common/utilityMethods.js';
import { ShrimpCommand } from '../../common/base.js';

export default <ShrimpCommand>{
	async execute(client, interaction) {
		if (!interaction || !interaction.guild || interaction.isContextMenuCommand()) {
			return;
		}

		await interaction.deferReply({ ephemeral: true });

		class BlackJackPlayer {
			static lastPosition = -2;

			readonly name: string;
			readonly member: GuildMember;
			readonly id: string;
			readonly hand: string[] = [];
			readonly position;

			public score: number;
			public handValue: number;

			public bust: boolean = false;
			public blackJack: boolean = false;
			public finished: boolean = false;

			constructor(player: GuildMember) {
				this.name = player.displayName;
				this.id = player.user.id;
				this.member = player;
				this.score = 0;
				this.handValue = 0;
				this.position = BlackJackPlayer.lastPosition += 2;
			}

			async hit(amount = 1) {
				while (amount) {
					this.hand.push(shuffledDeck.pop()!);
					amount--;
				}

				this.updateHandValue();

				blackJackEmbed.data.fields![this.position] = this.showHandField();

				await interaction.editReply({
					embeds: [
						blackJackEmbed.setFooter({
							text: `${this.name} chose to hit!`,
							iconURL: this.member.displayAvatarURL(client.imageOptions),
						}),
					],
					components: this.position === 2 ? [buttonRow] : [],
				});
			}

			async stand(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | ButtonInteraction) {
				this.finished = true;

				await interaction.editReply({
					embeds: [blackJackEmbed.setFooter({ text: `${this.name} chose to stand!` })],
					components: [],
				});
			}

			showHandField(win = false) {
				return {
					name: win ? bold(italic(`👑 ${this.name} - ${this.handValue} 👑`)) : bold(italic(`${this.name} - ${this.handValue}`)),
					value: `${this.hand.join('')}`,
					inline: true,
				};
			}

			updateHandValue() {
				this.handValue = 0;
				let aceCounter = 0;
				let aceValue: 11 | 1 = 11;
				const royalCards = ['jack', 'queen', 'king'];

				for (const card of this.hand) {
					if (royalCards.some((special) => card.toLowerCase().includes(special))) {
						this.handValue += 10;
					} else if (!card.toLowerCase().includes('ace')) {
						this.handValue += parseInt(`${card.match(/(\d+)/)}`);
					}

					if (card.toLowerCase().includes('ace')) {
						aceCounter++;

						this.handValue += aceValue;
					}
				}

				while (this.handValue > 21 && aceCounter) {
					this.handValue -= 10;
					aceCounter--;
				}
			}

			async isbust(interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction | ButtonInteraction) {
				const opposingPlayer: BlackJackPlayer = this.position === 0 ? playerOne : dealer; // TODO: update for multiplayer

				this.finished = true;

				if (this.handValue > 21) {
					blackJackEmbed.data.fields![opposingPlayer.position] = opposingPlayer.showHandField(true);

					await interaction.editReply({
						embeds: [
							blackJackEmbed
								.setFooter({
									text: `${this.name} got busted! ${opposingPlayer.name} won!`,
									iconURL: opposingPlayer.member.displayAvatarURL(client.imageOptions),
								})
								.setThumbnail(opposingPlayer.member.displayAvatarURL(client.imageOptions)),
						],
						components: [],
					});

					return true;
				}

				return false;
			}

			async hasBlackjack() {
				this.finished = true;

				if (this.handValue === 21) {
					blackJackEmbed.data.fields![this.position] = this.showHandField(true);

					await interaction.editReply({
						embeds: [
							blackJackEmbed
								.setFooter({
									text: this.position === 2 ? `${this.name} got 21, the dealer will try to tie` : `${this.name} got 21 and won!`,
									iconURL: this.member.displayAvatarURL(client.imageOptions),
								})
								.setThumbnail(this.member.displayAvatarURL(client.imageOptions)),
						],
						components: [],
					});

					return true;
				}

				return false;
			}
		}

		const shuffledDeck = shuffleArray(generateDeck());

		const embedColor = (await client.getGuildSettings(interaction.guild!)).categories.general.settings.embedColor.value;

		const blackJackEmbed = new EmbedBuilder()
			.setTitle(bold(italic('BLACKJACK')))
			.setColor(embedColor)
			.addFields(
				{
					name: `player 1`,
					value: `\u200b`,
					inline: true,
				},
				{
					name: bold(italic(`VS`)),
					value: `\u200b`,
					inline: true,
				},
				{
					name: `player 2`,
					value: `\u200b`,
					inline: true,
				}
			);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([client.buttons.hit, client.buttons.stand]);

		const dealer = new BlackJackPlayer(interaction.guild?.members.cache.get(client.user!.id) as GuildMember);
		const playerOne = new BlackJackPlayer(interaction.member as GuildMember);

		async function compareHands(): Promise<void> {
			if (playerOne.handValue === dealer.handValue) {
				blackJackEmbed.data.fields![0] = dealer.showHandField(true);
				blackJackEmbed.data.fields![2] = playerOne.showHandField(true);

				await interaction.editReply({
					embeds: [
						blackJackEmbed.setFooter({
							text: `This match ended in a draw!`,
							iconURL: playerOne.member.displayAvatarURL(client.imageOptions),
						}),
					],
					components: [],
				});

				return;
			}

			if (playerOne.handValue > dealer.handValue) {
				blackJackEmbed.data.fields![2] = playerOne.showHandField(true);

				await interaction.editReply({
					embeds: [
						blackJackEmbed
							.setFooter({
								text: `${playerOne.name} has the highest hand and won!`,
								iconURL: playerOne.member.displayAvatarURL(client.imageOptions),
							})
							.setThumbnail(playerOne.member.displayAvatarURL(client.imageOptions)),
					],
					components: [],
				});

				return;
			} else if (dealer.handValue > playerOne.handValue) {
				blackJackEmbed.data.fields![0] = dealer.showHandField(true);

				await interaction.editReply({
					embeds: [
						blackJackEmbed
							.setFooter({
								text: `${dealer.name} has the highest hand and won!`,
								iconURL: dealer.member.displayAvatarURL(client.imageOptions),
							})
							.setThumbnail(dealer.member.displayAvatarURL(client.imageOptions)),
					],
					components: [],
				});

				return;
			}
		}

		async function dealerStart(): Promise<void> {
			while (dealer.handValue < 17) {
				await dealer.hit();
			}

			if (await dealer.hasBlackjack()) {
				return;
			}

			if (await dealer.isbust(interaction)) {
				return;
			}

			await dealer.stand(interaction);

			if (playerOne.finished && dealer.finished) {
				await compareHands();
			}
		}

		await dealer.hit();
		await playerOne.hit(2);

		try {
			await interaction.editReply({
				embeds: [blackJackEmbed],
				components: [buttonRow],
			});

			if (await playerOne.hasBlackjack()) {
				await dealerStart();
			}

			const buttonCollector = (await interaction.fetchReply()).createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30000,
			});

			buttonCollector.on('collect', async (button) => {
				await button.deferUpdate();

				if (button.user.id !== playerOne.id) {
					await client.buttonDenied(button);

					return;
				}

				switch (button.customId) {
					case 'hit-button':
						await playerOne.hit();

						if (await playerOne.hasBlackjack()) {
							buttonCollector.stop('end');
						}

						if (await playerOne.isbust(button)) {
							buttonCollector.stop('bust');
						}
						break;

					case 'stand-button':
						await playerOne.stand(button);

						buttonCollector.stop('end');
						break;

					default:
						break;
				}
			});

			buttonCollector.on('end', async (_collected, reason) => {
				switch (reason) {
					case 'time':
						if (playerOne.handValue === 21) {
							return;
						}

						await interaction.editReply({
							content: null,
							embeds: [
								blackJackEmbed.setDescription(`${playerOne.name} didn't respond in time, maybe another time ${playerOne.name}`).setFooter({
									text: `${playerOne.name} didn't respond in time...`,
									iconURL: playerOne.member.displayAvatarURL(client.imageOptions),
								}),
							],
							components: [],
						});
						break;

					case 'bust':
						playerOne.finished = true;
						break;

					case 'end':
						await dealerStart();
						break;

					default:
						break;
				}
			});
		} catch (error) {
			client.handleError('Blackjack command', error as Error);
		}
	},
	slash: new SlashCommandBuilder()
		.setName('blackjack')
		.setDescription('Play blackjack with me')
		.addBooleanOption((mp) => mp.setName('multiplayer').setDescription('Wanna play with more people?').setRequired(false)),
};
