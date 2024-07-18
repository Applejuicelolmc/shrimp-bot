import {
	APIApplicationCommandOptionChoice,
	ActivityType,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AttachmentBuilder,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	EmojiResolvable,
	Guild,
	ImageURLOptions,
	PresenceData,
	SlashCommandBuilder,
	UserContextMenuCommandInteraction,
	WebhookClient,
	bold,
	codeBlock,
} from 'discord.js';
import GuildSettings, { IGuildSettingsSchema } from '../models/guildSettings.js';
import { generateDefaultSettings } from '../handlers/mongoDBHandler.js';
import startLogger from '../handlers/logHandler.js';
import { normalize, resolve } from 'path';
import fs from 'fs';

export class ShrimpClient extends Client {
	private _startDateTime = (Date.now() / 1000).toString().slice(0, 10);
	private _commands = new Collection<string, ShrimpCommand>();
	private _devCommands = new Collection<string, ShrimpCommand>();
	private _categories = new Collection<string, ShrimpCategory>();
	private _logger = startLogger();
	private _paths = {
		assets: normalize(resolve('.', 'dist', `assets`)),
		commands: normalize(resolve('.', 'dist', `commands`)),
		common: normalize(resolve('.', 'dist', `common`)),
		events: normalize(resolve('.', 'dist', `events`)),
		handlers: normalize(resolve('.', 'dist', `handlers`)),
		models: normalize(resolve('.', 'dist', `models`)),
		types: normalize(resolve('.', 'dist', `types`)),
	};

	private _gifs = {
		avatar: new AttachmentBuilder(`src/assets/gifs/avatar.gif`, {
			name: 'avatar.gif',
		}),
		bust: new AttachmentBuilder(`src/assets/gifs/bust.gif`, {
			name: 'bust.gif',
		}),
		draw: new AttachmentBuilder(`src/assets/gifs/draw.gif`, {
			name: 'draw.gif',
		}),
		pingpong: new AttachmentBuilder(`src/assets/gifs/ping-pong.gif`, {
			name: 'ping-pong.gif',
		}),
		whoyou: new AttachmentBuilder(`src/assets/gifs/who-you.gif`, {
			name: 'who-you.gif',
		}),
	};

	private _alertWebhook = new WebhookClient({
		url: process.env.ALERT_WEBHOOK_URL as string,
	});

	private _preLoginPresence: PresenceData = {
		status: 'dnd',
		afk: false,
		activities: [
			{
				name: `Starting up...`,
				type: ActivityType.Custom,
			},
		],
	};

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

	private _logOUtPresence: PresenceData = {
		status: 'invisible',
		afk: false,
		activities: [
			{
				name: `Logging off (PID: ${process.pid})`,
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
		spin: new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Spin').setCustomId('spin-button'),
		stop: new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Stop').setCustomId('stop-button'),
		hit: new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Hit').setCustomId('hit-button'),
		stand: new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Stand').setCustomId('stand-button'),
	};

	async _buttonDenied(button: ButtonInteraction, text: string = `You can't use this button...`) {
		await button.followUp({
			embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(`${this.emojis.cache.get('981339000705024040')?.toString()} ${text}`)],
			ephemeral: true,
		});

		return;
	}

	private _imageOptions: ImageURLOptions = {
		size: 4096,
		forceStatic: false,
	};

	get startDateTime() {
		return this._startDateTime;
	}

	get commands(): Collection<string, ShrimpCommand> {
		return this._commands;
	}

	get devCommands(): Collection<string, ShrimpCommand> {
		return this._devCommands;
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

	get gifs() {
		return this._gifs;
	}

	get preLoginPresence() {
		return this._preLoginPresence;
	}

	get defaultPresence() {
		return this._defaultPresence;
	}

	get logOutPresence() {
		return this._logOUtPresence;
	}

	get alertWebhook() {
		return this._alertWebhook;
	}

	get buttons() {
		return this._buttons;
	}

	get buttonDenied() {
		return this._buttonDenied;
	}

	get imageOptions() {
		return this._imageOptions;
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

	setHealthStatus(setHealthy: boolean) {
		// TODO Fix permission error inside docker container when setting to false might be a bad path ¯\_(ツ)_/¯
		const unHealthyExists = fs.existsSync('config/unhealthy');

		if (setHealthy && unHealthyExists) {
			try {
				fs.rmSync(`config/unhealthy`);
			} catch (error) {
				this.handleError('Setting health status to true', error as Error);
			}
		} else if (!setHealthy && !unHealthyExists) {
			try {
				fs.writeFileSync(`config/unhealthy`, '');
				this.infoLogger.info(`Setting healthy status to: ${setHealthy}`);
			} catch (error) {
				this.handleError('Setting health status to false', error as Error);
			}
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
	autocomplete?(client: ShrimpClient, interaction: AutocompleteInteraction): Promise<void>;
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
