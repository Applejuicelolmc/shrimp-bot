import {
	ActionRowBuilder,
	ActivityType,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ComponentType,
	EmbedBuilder,
	GuildMember,
	ImageURLOptions,
	SlashCommandBuilder,
	bold,
	italic,
} from 'discord.js';
import { generateDeck, shuffleArray } from '../../common/utilityMethods.js';
import { ShrimpCommand } from '../../common/base.js';

export default <ShrimpCommand>{
	async execute(client, interaction) {
		// TODO: find bugs in calculation

		if (interaction.isContextMenuCommand()) {
			return;
		}

		await interaction.deferReply({ ephemeral: true });

		const shuffledDeck = shuffleArray(generateDeck());

		const embedColor = (await client.getGuildSettings(interaction.guild!)).categories.general.settings.embedColor.value;

		if (shuffledDeck.length === 0) {
			return interaction.reply({
				content: 'something went wrong, try again later',
				ephemeral: true,
			});
		}

		function deniedEmbed(text: string) {
			return new EmbedBuilder().setColor(Colors.Red).setDescription(`${client.customEmojis.get('981339000705024040')} ${text}`);
		}

		const hitButton = new ButtonBuilder({
			style: ButtonStyle.Success,
			customId: 'hit-button',
			label: 'Hit',
		});

		const standButton = new ButtonBuilder({
			style: ButtonStyle.Danger,
			customId: 'stand-button',
			label: 'Stand',
		});

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

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([hitButton, standButton]);

		class BlackJackPlayer {
			static lastPosition = -2;

			readonly name: string;
			readonly member: GuildMember;
			readonly id: string;
			readonly hand: string[] = [];
			readonly position;
			public score: number;
			public handValue: number;

			public status: 'CHOOSING' | 'DONE' = 'CHOOSING';

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

			stand() {
				this.status = 'DONE';
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

						if (this.handValue > 21) {
							aceValue = 1;
							this.handValue -= 10;
						}

						if (aceValue === 1 && aceCounter === 2) {
							this.handValue -= 10;
						}
					}
				}
			}

			async checkWin(): Promise<boolean> {
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

					if (this.position === 2) {
						await dealerTurn();
					}

					return true;
				} else {
					return false;
				}
			}
		}

		const dealer = new BlackJackPlayer(interaction.guild?.members.cache.get(client.user!.id) as GuildMember);
		const playerOne = new BlackJackPlayer(interaction.member as GuildMember);

		client.user?.setPresence({
			status: 'online',
			afk: false,
			activities: [
				{
					state: `Blackjack with ${playerOne.name}`,
					name: `Blackjack`,
					type: ActivityType.Playing,
				},
			],
		});

		setTimeout(() => {
			client.user?.setPresence(client.defaultPresence);
		}, 60000);

		async function dealerTurn() {
			while (dealer.handValue <= 16) {
				await dealer.hit();

				if (dealer.handValue > 21) {
					blackJackEmbed.data.fields![2] = playerOne.showHandField(true);

					await interaction.editReply({
						embeds: [
							blackJackEmbed
								.setFooter({
									text: `${dealer.name} got busted! ${playerOne.name} won!`,
									iconURL: playerOne.member.displayAvatarURL(client.imageOptions),
								})
								.setThumbnail(playerOne.member.displayAvatarURL(client.imageOptions)),
						],
						components: [],
					});

					return;
				}
			}

			dealer.stand();

			if (playerOne.status === 'DONE' && dealer.status === 'DONE') {
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
				}

				if (await dealer.checkWin()) {
					return;
				}

				if (playerOne.handValue > dealer.handValue) {
					blackJackEmbed.data.fields![2] = playerOne.showHandField(true);
					await interaction.editReply({
						embeds: [
							blackJackEmbed
								.setFooter({
									text: `${playerOne.name} has the highest hand and won!`,
									iconURL: playerOne.member.displayAvatarURL(imageOptions),
								})
								.setThumbnail(playerOne.member.displayAvatarURL(imageOptions)),
						],
						components: [],
					});
				}

				if (dealer.handValue > playerOne.handValue) {
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
				}
			}
		}

		await dealer.hit();
		await playerOne.hit(2);

		try {
			await interaction.editReply({
				embeds: [blackJackEmbed],
				components: [buttonRow],
			});

			await playerOne.checkWin();

			const buttonCollector = (await interaction.fetchReply()).createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30000,
			});

			buttonCollector.on('collect', async (button) => {
				await button.deferUpdate();

				if (button.user.id !== playerOne.id) {
					await button.followUp({
						embeds: [deniedEmbed("You can't use this button...")],
						ephemeral: true,
					});

					return;
				}

				switch (button.customId) {
					case 'hit-button':
						await playerOne.hit();

						if (playerOne.handValue > 21) {
							blackJackEmbed.data.fields![0] = dealer.showHandField(true);

							await button.editReply({
								embeds: [
									blackJackEmbed
										.setFooter({
											text: `${playerOne.name} got busted! ${dealer.name} won!`,
											iconURL: dealer.member.displayAvatarURL(client.imageOptions),
										})
										.setThumbnail(dealer.member.displayAvatarURL(client.imageOptions)),
								],
								components: [],
							});

							buttonCollector.stop('end');
						}

						if (playerOne.handValue === 21) {
							blackJackEmbed.data.fields![2] = playerOne.showHandField(true);

							await button.editReply({
								embeds: [
									blackJackEmbed
										.setFooter({
											text: `${playerOne.name} got 21 and won!`,
											iconURL: playerOne.member.displayAvatarURL(client.imageOptions),
										})
										.setThumbnail(playerOne.member.displayAvatarURL(client.imageOptions)),
								],
								components: [],
							});

							buttonCollector.stop('end');
						}
						break;

					case 'stand-button':
						playerOne.stand();

						await button.editReply({
							embeds: [blackJackEmbed.setFooter({ text: `${playerOne.name} chose to stand!` })],
							components: [],
						});

						buttonCollector.stop('stand');
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

					case 'stand':
						await dealerTurn();
						break;

					case 'end':
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
