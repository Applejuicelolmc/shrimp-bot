import {
	APIApplicationCommandOptionChoice,
	ActivityType,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonBuilder,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	EmojiResolvable,
	Guild,
	PresenceData,
	SlashCommandBuilder,
	UserContextMenuCommandInteraction,
	WebhookClient,
	bold,
	codeBlock,
} from 'discord.js';
import { normalize, resolve } from 'path';
import startLogger from '../handlers/logHandler.js';
import { ButtonStyle } from 'discord.js';
import GuildSettings, { IGuildSettingsSchema } from '../models/guildSettings.js';
import { generateDefaultSettings } from '../handlers/mongoDBHandler.js';

export class ShrimpClient extends Client {
	private _commands = new Collection<string, ShrimpCommand>();
	private _categories = new Collection<string, ShrimpCategory>();
	private _logger = startLogger();
	private _paths = {
		assets: normalize(resolve('.', 'src', `assets`)),
		commands: normalize(resolve('.', 'src', `commands`)),
		common: normalize(resolve('.', 'src', `common`)),
		events: normalize(resolve('.', 'src', `events`)),
		handlers: normalize(resolve('.', 'src', `handlers`)),
		models: normalize(resolve('.', 'src', `models`)),
		types: normalize(resolve('.', 'src', `types`)),
	};

	private _alertWebhook = new WebhookClient({
		url: process.env.ALERT_WEBHOOK_URL as string,
	});

	private _defaultPresence: PresenceData = {
		status: 'idle',
		afk: false,
		activities: [
			{
				name: `Flying to da moon 🪐`,
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				type: ActivityType.Custom,
			},
		],
	};

	private _buttons = {
		home: new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Home').setCustomId('home-button'),
		back: new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Back').setCustomId('back-button'),
		edit: new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Edit').setCustomId('edit-button'),
		yes: new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Yes').setCustomId('yes-button'),
		no: new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('No').setCustomId('no-button'),
		set: new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Set').setCustomId('set-button'),
		reset: new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Reset').setCustomId('reset-button'),
		join: new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Join').setCustomId('join-button'),
		leave: new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Leave').setCustomId('leave-button'),
		accept: new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Accept').setCustomId('accept-button'),
		decline: new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Decline').setCustomId('decline-button'),
	};

	private _guildEmoji() {
		return this.emojis.cache;
	}

	get commands(): Collection<string, ShrimpCommand> {
		return this._commands;
	}

	get categories(): Collection<string, ShrimpCategory> {
		return this._categories;
	}

	get infoLogger() {
		return this._logger.get('info');
	}

	get errorLogger() {
		return this._logger.get('error');
	}

	get debugLogger() {
		return this._logger.get('debug');
	}

	get warningLogger() {
		return this._logger.get('warning');
	}

	get paths() {
		return this._paths;
	}

	get defaultPresence() {
		return this._defaultPresence;
	}

	get alertWebhook() {
		return this._alertWebhook;
	}

	get buttons() {
		return this._buttons;
	}

	get customEmojis() {
		return this._guildEmoji();
	}

	async getGuildSettings(guild: Guild): Promise<IGuildSettingsSchema> {
		try {
			return (await GuildSettings.findOne({
				guildId: guild.id,
			})) as IGuildSettingsSchema;
		} catch (error) {
			this.handleError('Fetching guildSettings', error as Error);
		}

		return await generateDefaultSettings(guild);
	}

	async changeAvatar(pathToAvatar = `${this.paths.assets}/gifs/avatar.gif`): Promise<void> {
		try {
			if (this.user) {
				this.user.setAvatar(pathToAvatar);

				await this.alertWebhook.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
							.addFields({
								name: `${bold(`Event:`)}`,
								value: `Updated avatar`,
							})
							.setColor(Colors.Aqua),
					],
				});
			}
		} catch (error) {
			this.handleError('change avatar', error as Error);
		}
	}

	handleError(title: string, error: Error) {
		try {
			if (error instanceof Error) {
				this.errorLogger.error(`${title}: ${error.stack}`);

				return this.alertWebhook.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${bold(`ERROR | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
							.addFields([
								{
									name: `${title}:`,
									value: codeBlock(`${error.stack!.length > 1024 ? error.message : error.stack}`),
								},
							])
							.setColor(Colors.Red),
					],
				});
			} else {
				return this.errorLogger.error(`${title}: ${error}`);
			}
		} catch (error) {
			this.handleError('Bad shit', error as Error);
		}
	}
}

export interface ShrimpCategory {
	name: string;
	info: {
		description: string;
		position: number;
		emoji: EmojiResolvable;
		commandNames: string[];
	};
}

export interface ShrimpCommand {
	execute(client: ShrimpClient, interaction: ChatInputCommandInteraction | UserContextMenuCommandInteraction): Promise<void>;
	slash: SlashCommandBuilder;
	context?: ContextMenuCommandBuilder;
}

export interface ShrimpEvent {
	name: string;
	once: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	execute(client: ShrimpClient, ...args: any): Promise<void>;
}

export interface SlashData {
	name: string;
	description: string;
	options?: SlashOptions;
	type?: ApplicationCommandType;
}

export interface SlashOptions {
	type: ApplicationCommandOptionType;
	name: string;
	description: string;
	required: boolean;
	channelTypes?: (
		| ChannelType.GuildText
		| ChannelType.GuildVoice
		| ChannelType.GuildCategory
		| ChannelType.GuildNews
		| ChannelType.GuildNewsThread
		| ChannelType.GuildPublicThread
		| ChannelType.GuildPrivateThread
		| ChannelType.GuildStageVoice
	)[];
	choices?: APIApplicationCommandOptionChoice<string>[];
}
