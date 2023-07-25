
import {
	ActionRowBuilder,
	ApplicationCommandType,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ComponentType,
	ContextMenuCommandBuilder,
	EmbedField,
	GuildMember,
	ImageURLOptions,
	Message,
	SlashCommandBuilder,
} from 'discord.js';
import { ShrimpCommand } from '../../common/base';
import { EmbedBuilder, bold, italic } from '@discordjs/builders';

export default <ShrimpCommand>{
	async execute(client, interaction): Promise<void> {
		// TODO cleanup/optimize

		if (!interaction || !interaction.guild) {
			return;
		}

		const imageOptions: ImageURLOptions = {
			size: 4096,
			forceStatic: false,
		};

		function deniedEmbed(text: string) {
			return new EmbedBuilder().setColor(Colors.Red).setDescription(`${client.customEmojis.get('981339000705024040')} ${text}`);
		}

		const matchUps = {
			'🪨': {
				weakTo: '📄',
				strongTo: '✂️',
			},
			'📄': {
				weakTo: '✂️',
				strongTo: '🪨',
			},
			'✂️': {
				weakTo: '🪨',
				strongTo: '📄',
			},
		};

		const rockButton = new ButtonBuilder({
			style: ButtonStyle.Primary,
			customId: 'rock-button',
			emoji: '🪨',
		});

		const paperButton = new ButtonBuilder({
			style: ButtonStyle.Primary,
			customId: 'paper-button',
			emoji: '📄',
		});

		const scissorsButton = new ButtonBuilder({
			style: ButtonStyle.Primary,
			customId: 'scissors-button',
			emoji: '✂️',
		});

		class Player {
			readonly name: string;
			readonly member: GuildMember;
			readonly id: string;

			public status: 'CHOOSING' | 'DONE' = 'CHOOSING';
			public choice: '🪨' | '📄' | '✂️' | '' = '';

			constructor(player: GuildMember) {
				this.name = player.displayName;
				this.id = player.user.id;
				this.member = player;
			}

			updateChoice(choice: '🪨' | '📄' | '✂️', embed?: EmbedBuilder, position?: 0 | 2) {
				this.choice = choice;
				this.status = 'DONE';

				if (position && embed && embed.data.fields) {
					embed.data.fields[position] = this.showStatusField();
				}
			}

			updateEmbed(baseEmbed: EmbedBuilder) {
				return baseEmbed;
			}

			showStatusField(): EmbedField {
				return {
					name: this.name,
					value: `${this.status === 'CHOOSING' ? 'Still choosing' : this.status === 'DONE' ? 'Has Chosen' : 'What happened here?'}`,
					inline: true,
				};
			}

			showChoices(win = false): EmbedField {
				return {
					name: win ? `👑 ${this.name} 👑` : this.name,
					value: `Has chosen ${this.choice}`,
					inline: true,
				};
			}
		}

		const playerOne = new Player(interaction.member as GuildMember);
		const playerTwo = new Player(
			interaction.isUserContextMenuCommand() ? (interaction.targetMember as GuildMember) : (interaction.options.getMember('opponent') ? interaction.options.getMember('opponent') as GuildMember : interaction.guild.members.cache.get(client.user!.id) as GuildMember )
		);

		const embedColor = (await client.getGuildSettings(interaction.guild)).categories.general.settings.embedColor.value;

		const gameEmbed = new EmbedBuilder()
			.setTitle(
				playerOne.name.toLocaleLowerCase().includes('ant') ||
					playerTwo.name.toLocaleLowerCase().includes('ant')
					? bold(italic('ROCKS PAPERS SCISSORS - ᵃⁿᵗ ᵉᵈᶦᵗᶦᵒⁿ'))
					: bold(italic('ROCK PAPER SCISSORS'))
			)
			.setDescription(`${playerOne.member.user} has challenged ${playerTwo.member.user}!`)
			.setFooter({
				text: `Waiting for ${playerTwo.name} to accept your challenge...`,
				iconURL: playerTwo.member.displayAvatarURL(imageOptions),
			});

		const challengeButtons = new ActionRowBuilder<ButtonBuilder>().addComponents([client.buttons.accept, client.buttons.decline]);

		const spacingField: EmbedField = {
			name: bold(italic('VS')),
			value: '\u200b',
			inline: true,
		};

		try {
			if (playerTwo.id === client.user?.id) {
				const choices: ('🪨' | '📄' | '✂️')[] = ['🪨', '📄', '✂️'];

				await interaction.reply({
					embeds: [
						gameEmbed
							.setDescription(null)
							.addFields([playerOne.showStatusField(), spacingField, playerTwo.showStatusField()])
							.setFooter({
								text: 'Challenge Accepted!',
								iconURL: client.user.displayAvatarURL(imageOptions),
							}),
					],

					components: [
						new ActionRowBuilder<ButtonBuilder>({
							components: [rockButton, paperButton, scissorsButton],
						}),
					],

					ephemeral: true,
				});

				playerTwo.updateChoice(choices[Math.floor(Math.random() * choices.length)], gameEmbed, 2);

				const botMatchMessage = await interaction.fetchReply();

				const botMatchCollector = botMatchMessage.createMessageComponentCollector({
						componentType: ComponentType.Button,
						time: 30000,
					});

				botMatchCollector.on('collect', async (botMatchButton) => {
					await botMatchButton.deferUpdate();

					if (botMatchButton.user.id !== playerOne.id) {
						await botMatchButton.followUp({
							embeds: [deniedEmbed("You can't use this button...")],
							ephemeral: true,
						});

						return;
					}

					switch (botMatchButton.customId) {
						case 'rock-button':
							playerOne.updateChoice('🪨', gameEmbed, 0);

							await botMatchButton.editReply({
								embeds: [gameEmbed],
							});
							break;

						case 'paper-button':
							playerOne.updateChoice('📄', gameEmbed, 0);

							await botMatchButton.editReply({
								embeds: [gameEmbed],
							});
							break;

						case 'scissors-button':
							playerOne.updateChoice('✂️', gameEmbed, 0);

							await botMatchButton.editReply({
								embeds: [gameEmbed],
							});
							break;

						default:
							break;
					}

					if (!gameEmbed.data.fields) {
						return;
					}

					if (playerOne.status === 'DONE' && playerTwo.status === 'DONE') {
						gameEmbed.data.fields[0] = playerOne.showChoices();
						gameEmbed.data.fields[2] = playerTwo.showChoices();

						await botMatchButton.editReply({
							embeds: [gameEmbed],
						});

						botMatchCollector.stop('end');
					}
				});

				botMatchCollector.on('end', async (_collected, reason) => {
					if (reason === 'time') {
						await interaction.editReply({
							embeds: [
								gameEmbed.setFooter({
									text: `${playerOne.status === 'CHOOSING' ? playerOne.name : playerTwo.name} didn't choose in time and lost...`,
									iconURL:
										playerOne.status === 'CHOOSING'
											? playerOne.member.displayAvatarURL(imageOptions)
											: playerTwo.member.displayAvatarURL(imageOptions),
								}),
							],
							components: [],
						});
					}

					if (!gameEmbed.data.fields) {
						return;
					}

					if (matchUps[playerOne.choice as '🪨' | '📄' | '✂️'].strongTo === playerTwo.choice) {
						gameEmbed.data.fields[0] = playerOne.showChoices(true);

						await interaction.editReply({
							embeds: [
								gameEmbed
									.setFooter({
										text: `${playerOne.name} has won!`,
										iconURL: playerOne.member.displayAvatarURL(imageOptions),
									})
									.setThumbnail(playerOne.member.displayAvatarURL(imageOptions)),
							],
							components: [],
						});
					}

					if (matchUps[playerOne.choice as '🪨' | '📄' | '✂️'].weakTo === playerTwo.choice) {
						gameEmbed.data.fields[2] = playerTwo.showChoices(true);

						await interaction.editReply({
							embeds: [
								gameEmbed
									.setFooter({
										text: `${playerTwo.name} has won!`,
										iconURL: playerTwo.member.displayAvatarURL(imageOptions),
									})
									.setThumbnail(playerTwo.member.displayAvatarURL(imageOptions)),
							],
							components: [],
						});
					}

					const drawGif = new AttachmentBuilder('src/assets/gifs/draw.gif', {
						name: 'draw.gif',
					});
					

					if (playerOne.choice === playerTwo.choice) {
						await interaction.editReply({
							embeds: [
								gameEmbed.setFooter({
									text: "It's a draw!",
									iconURL: client.user!.displayAvatarURL(imageOptions),
								})
								.setThumbnail('attachment://draw.gif'),
							],
							files: [ drawGif ],
							components: [],
						});
					}
				});

				return;
			}

			await interaction.reply({
				content: `You've been challenged ${playerTwo.member}!`,
				embeds: [gameEmbed],
				components: [challengeButtons],
			});

			const challengeMessage = (await interaction.fetchReply()) as Message;

			const challengeButtonCollector = challengeMessage.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 30000,
				});

			challengeButtonCollector.on('collect', async (challengeButton) => {
				await challengeButton.deferUpdate();

				if (challengeButton.user.id !== playerTwo.id) {
					await challengeButton.followUp({
						embeds: [deniedEmbed("You can't use this button...")],
						ephemeral: true,
					});

					return;
				}

				switch (challengeButton.customId) {
					case 'accept-button':
						await challengeButton.editReply({
							content: null,
							embeds: [
								gameEmbed
									.setDescription(null)
									.addFields([playerOne.showStatusField(), spacingField, playerTwo.showStatusField()])
									.setFooter({
										text: 'Challenge Accepted!',
										iconURL: client.user?.displayAvatarURL(imageOptions),
									}),
							],

							components: [
								new ActionRowBuilder<ButtonBuilder>({
									components: [rockButton, paperButton, scissorsButton],
								}),
							],
						});

						challengeButtonCollector.stop('accepted');
						break;

					case 'decline-button':
						challengeButtonCollector.stop('declined');
						break;

					default:
						break;
				}
			});

			challengeButtonCollector.on('end', async (_collected, reason) => {
				const gameMessage = (await interaction.fetchReply()) as Message;
				const gameButtonCollector = gameMessage.createMessageComponentCollector({
						componentType: ComponentType.Button,
						time: 30000,
					});

				switch (reason) {
					case 'time':
						await interaction.editReply({
							content: null,
							embeds: [
								gameEmbed
									.setDescription(`${playerTwo.member.toString()} didn't respond in time, maybe another time ${playerOne.name}`)
									.setFooter({
										text: `${playerTwo.name} didn't respond in time...`,
										iconURL: playerTwo.member.displayAvatarURL(imageOptions),
									}),
							],
							components: [],
						});
						break;
					case 'declined':
						await interaction.editReply({
							content: null,
							embeds: [
								gameEmbed
									.setDescription(`${playerTwo.member.toString()} declined this challenge, maybe next time ${playerOne.member.toString()}!`)
									.setFooter({
										text: `${playerTwo.name} has chickened out of this challenge!`,
										iconURL: playerTwo.member.displayAvatarURL(imageOptions),
									}),
							],
							components: [],
						});
						break;
					case 'accepted':
						gameButtonCollector.on('collect', async (choice) => {
							await choice.deferUpdate();

							if (!gameEmbed.data.fields) {
								return;
							}

							if (choice.user.id !== playerOne.id && choice.user.id !== playerTwo.id) {
								await choice.followUp({
									embeds: [deniedEmbed("You can't use this button...")],
									ephemeral: true,
								});
							}

							switch (choice.customId) {
								case 'rock-button':
									switch (choice.user.id) {
										case playerOne.id:
											playerOne.updateChoice('🪨', gameEmbed, 0);

											await choice.editReply({
												embeds: [gameEmbed],
											});
											break;

										case playerTwo.id:
											playerTwo.updateChoice('🪨', gameEmbed, 2);

											await choice.editReply({
												embeds: [gameEmbed],
											});
											break;

										default:
											break;
									}

									break;

								case 'paper-button':
									switch (choice.user.id) {
										case playerOne.id:
											playerOne.updateChoice('📄', gameEmbed, 0);

											await choice.editReply({
												embeds: [gameEmbed],
											});
											break;

										case playerTwo.id:
											playerTwo.updateChoice('📄', gameEmbed, 2);

											await choice.editReply({
												embeds: [gameEmbed],
											});
											break;

										default:
											break;
									}
									break;

								case 'scissors-button':
									switch (choice.user.id) {
										case playerOne.id:
											playerOne.updateChoice('✂️', gameEmbed, 0);

											await choice.editReply({
												embeds: [gameEmbed],
											});
											break;

										case playerTwo.id:
											playerTwo.updateChoice('✂️', gameEmbed, 2);

											await choice.editReply({
												embeds: [gameEmbed],
											});
											break;

										default:
											break;
									}
									break;

								default:
									break;
							}

							if (playerOne.status === 'DONE' && playerTwo.status === 'DONE') {
								gameEmbed.data.fields[0] = playerOne.showChoices();
								gameEmbed.data.fields[2] = playerTwo.showChoices();

								await choice.editReply({
									embeds: [gameEmbed],
								});

								gameButtonCollector.stop('end');
							}
						});

						gameButtonCollector.on('end', async (_collected, reason) => {
								if (reason === 'time') {
									await interaction.editReply({
										embeds: [
											gameEmbed.setFooter({
											text: `${playerOne.status === 'CHOOSING' ? playerOne.name : playerTwo.name} didn't choose in time and lost...`,
												iconURL:
												playerOne.status === 'CHOOSING'
													? playerOne.member.displayAvatarURL(imageOptions)
													: playerTwo.member.displayAvatarURL(imageOptions),
											}),
										],
										components: [],
									});
								}

								if (!gameEmbed.data.fields) {
									return;
								}

							if (matchUps[playerOne.choice as '🪨' | '📄' | '✂️'].strongTo === playerTwo.choice) {
								gameEmbed.data.fields[0] = playerOne.showChoices(true);

									await interaction.editReply({
										embeds: [
											gameEmbed
												.setFooter({
													text: `${playerOne.name} has won!`,
												iconURL: playerOne.member.displayAvatarURL(imageOptions),
												})
											.setThumbnail(playerOne.member.displayAvatarURL(imageOptions)),
										],
										components: [],
									});
								}

							if (matchUps[playerOne.choice as '🪨' | '📄' | '✂️'].weakTo === playerTwo.choice) {
								gameEmbed.data.fields[2] = playerTwo.showChoices(true);

									await interaction.editReply({
										embeds: [
											gameEmbed
												.setFooter({
													text: `${playerTwo.name} has won!`,
												iconURL: playerTwo.member.displayAvatarURL(imageOptions),
												})
											.setThumbnail(playerTwo.member.displayAvatarURL(imageOptions)),
										],
										components: [],
									});
								}

								if (playerOne.choice === playerTwo.choice) {
									await interaction.editReply({
										embeds: [
											gameEmbed.setFooter({
												text: "It's a draw!",
											iconURL: client.user!.displayAvatarURL(imageOptions),
											}),
										],
										components: [],
									});
								}
						});

						break;
					default:
						break;
				}
			});
		} catch (error) {
			client.handleError('rps command', error as Error);
		}
	},
	slash: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Play the ultimate decision making game against another user!')
		.addUserOption((option) => option.setName('opponent').setDescription('The opponent you want to play againt (includes me!)').setRequired(false)),

	context: new ContextMenuCommandBuilder().setName('rps').setType(ApplicationCommandType.User),
};
