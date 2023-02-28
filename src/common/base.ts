import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ChannelType, Client, Collection, CommandInteraction, EmojiResolvable, SlashCommandBuilder } from "discord.js";
import { normalize, resolve } from "path";
import startLogger from "../handlers/logHandler";
import { ButtonStyle } from "discord.js";

export class ShrimpClient extends Client {
	private _commands = new Collection<string, ShrimpCommand>();
	private _categories = new Collection<string, ShrimpCategory>();
	private _logger = startLogger(this);
	private _paths = {
		commands: normalize(resolve('.', 'src', `commands`)),
		common: normalize(resolve('.', 'src', `common`)),
		events: normalize(resolve('.', 'src', `events`)),
		handlers: normalize(resolve('.', 'src', `handlers`)),
	}

	private _buttons = {
		home: new ButtonBuilder()
			.setStyle(ButtonStyle.Primary)
			.setLabel('Home')
			.setCustomId('home-button'),
		back: new ButtonBuilder()
			.setStyle(ButtonStyle.Primary)
			.setLabel('Back')
			.setCustomId('back-button'),
		yes: new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setLabel('Yes')
			.setCustomId('yes-button'),
		no: new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel('No')
			.setCustomId('no-button'),
		set: new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setLabel('Set')
			.setCustomId('set-button'),
		reset: new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel('Reset')
			.setCustomId('reset-button'),
		join: new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setLabel('Join')
			.setCustomId('join-button'),
		leave: new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel('Leave')
			.setCustomId('leave-button'),
		accept: new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setLabel('Accept')
			.setCustomId('accept-button'),
		decline: new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel('Decline')
			.setCustomId('decline-button'),
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

	get paths() {
		return this._paths;
	}

	get buttons() {
		return this._buttons;
	}
}

export interface ShrimpCategory {
	name: string,
	info: {
		description: string,
		position: number,
		emoji: EmojiResolvable,
		commandNames: string[],
	}
}

export interface ShrimpCommand {
	execute(client: ShrimpClient, interaction: CommandInteraction): Promise<void>;
	info: SlashCommandBuilder
}

export interface ShrimpEvent {
	name: string
	once: boolean
	execute(client: ShrimpClient, ...args: any): Promise<void>;
}

export interface SlashData {
	name: string
	description: string
	options?: SlashOptions,
	type?: ApplicationCommandType
}

export interface SlashOptions {
	type: ApplicationCommandOptionType
	name: string,
	description: string
	required: boolean
	channelTypes?: (ChannelType.GuildText | ChannelType.GuildVoice | ChannelType.GuildCategory | ChannelType.GuildNews | ChannelType.GuildNewsThread | ChannelType.GuildPublicThread | ChannelType.GuildPrivateThread | ChannelType.GuildStageVoice)[]
	choices?: APIApplicationCommandOptionChoice<string>[]
}