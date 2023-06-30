import {
	AttachmentBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { ShrimpCommand } from '../../common/base';
import { rollDice } from '../../common/utilityMethods';
import { GlobalFonts, createCanvas, loadImage } from '@napi-rs/canvas';

export default <ShrimpCommand>{
	async execute(client, interaction: ChatInputCommandInteraction) {
		//TODO Add some theming options via server settings

		const dice = interaction.options.getNumber('dice');
		const amount = interaction.options.getNumber('amount') || 1;
		const modifier = interaction.options.getNumber('modifier') || 0;

		GlobalFonts.registerFromPath(
			'src/assets/fonts/immortal.ttf',
			'Immortal'
		);

		if (!dice || !interaction || !interaction.guild) {
			return;
		}

		async function createDice(
			dice: number,
			total: number
		): Promise<AttachmentBuilder> {
			const canvas = createCanvas(256, 256);
			const context = canvas.getContext('2d');

			let centerOffset = 10;

			switch (dice) {
				case 6:
					centerOffset += 5;
					break;

				case 4:
					centerOffset += 15;
					break;

				default:
					break;
			}

			// TODO Theme
			// Purple background (for testing purposes)
			// context.fillStyle = `#9b59b6`;
			// context.fillRect(0, 0, canvas.width, canvas.height);
			// context.globalCompositeOperation = 'destination-in';

			const background = await loadImage(
				'./src/assets/backgrounds/galaxy.png'
			);

			const icon = await loadImage(`src/assets/icons/D${dice}.svg`);

			context.drawImage(background, 0, 0, canvas.width, canvas.height);

			// TODO Theme
			// Changes how images/text/icons/etc are layered on top of each other
			// Gotta play some more with this
			// context.globalCompositeOperation = 'destination-in';

			context.drawImage(icon, 0, 0, canvas.width, canvas.height);

			context.font = `40px Immortal`;
			context.textAlign = 'center';
			context.fillStyle = '#ffffff'; //context.createPattern(background, 'no-repeat'); (Display image over text instead of a solid color)
			context.fillText(
				`${total}`,
				canvas.width / 2,
				canvas.height / 2 + centerOffset
			);

			return new AttachmentBuilder(await canvas.encode('png'), {
				name: 'dice.png',
			});
		}

		await interaction.deferReply({ ephemeral: true });

		const embedColor = (await client.getGuildSettings(interaction.guild))
			.categories.general.settings.embedColor.value;

		const rollEmbed = new EmbedBuilder()
			.setTitle(`***ROLLED D${dice} x ${amount} ***`)
			.setColor(embedColor)
			.setImage('attachment://dice.png')
			.setThumbnail(interaction.user.avatarURL());

		let totalValues = 0;

		for (let i = 0; i < amount; i++) {
			const currentRoll = rollDice(dice);

			totalValues += currentRoll;

			if (amount === 1) {
				continue;
			}

			rollEmbed.addFields({
				name: `🎲 ${currentRoll}`,
				value: `\u200b`,
				inline: true,
			});
		}

		if (amount % 3 === 1) {
			rollEmbed.addFields(
				{
					name: `\u200b`,
					value: `\u200b`,
					inline: true,
				},
				{
					name: `\u200b`,
					value: `\u200b`,
					inline: true,
				}
			);
		} else {
			rollEmbed.addFields({
				name: `\u200b`,
				value: `\u200b`,
				inline: true,
			});
		}

		if (modifier > 0 || modifier < 0) {
			rollEmbed.addFields({
				name: `***MODIFIER: ${
					modifier < 0 ? modifier : `+${modifier}`
				}***`,
				value: `\u200b`,
				inline: false,
			});
		}

		rollEmbed.addFields({
			name: `***TOTAL: 🎲 ${totalValues + modifier}***`,
			value: `\u200b`,
			inline: false,
		});

		const diceImage = await createDice(dice, totalValues + modifier);

		try {
			interaction.editReply({
				embeds: [rollEmbed],
				files: [diceImage],
			});
		} catch (error) {
			client.handleError(
				`[${interaction.guildId}] Dice command`,
				error as Error
			);
		}
	},

	slash: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll some dice(s)!')
		.addNumberOption((dice) =>
			dice
				.setName('dice')
				.setDescription('The specific dice you want')
				.addChoices(
					{
						name: 'D20',
						value: 20,
					},
					{
						name: 'D12',
						value: 12,
					},
					{
						name: 'D10',
						value: 10,
					},
					{
						name: 'D8',
						value: 8,
					},
					{
						name: 'D6',
						value: 6,
					},
					{
						name: 'D4',
						value: 4,
					}
				)
				.setRequired(true)
		)
		.addNumberOption((amount) =>
			amount
				.setName('amount')
				.setDescription(
					'The amount of dice you want to throw, 1 by default.'
				)
				.setMinValue(2)
				.setMaxValue(9)
				.setRequired(false)
		)
		.addNumberOption((modifier) =>
			modifier
				.setName('modifier')
				.setDescription(
					'The modifier to add or subtract to/from your roll, 0 by default'
				)
				.setRequired(false)
		),
};
