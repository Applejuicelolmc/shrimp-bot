import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, Client, Collection, CommandInteraction, EmojiResolvable, Interaction, MessageInteraction, SlashCommandBuilder } from "discord.js";
import { normalize, resolve } from "path";
import startLogger from "../handlers/logHandler";

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