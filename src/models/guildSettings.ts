import { ColorResolvable, TextChannel, Webhook } from 'discord.js';
import { Schema, model } from 'mongoose';
import { ShrimpCommand } from '../common/base';

export type Settings = NonNullable<IColorSetting | IDisableCommandsSetting | IBooleanSetting | ITextChannelSetting | IWebhookSetting>;

export interface IBaseSetting {
	fullName: string;
	description: string;
}

export interface IColorSetting extends IBaseSetting {
	value: ColorResolvable;
}

export interface IDisableCommandsSetting extends IBaseSetting {
	value: ShrimpCommand[] | 'none';
}

export interface IBooleanSetting extends IBaseSetting {
	value: boolean;
}

export interface ITextChannelSetting extends IBaseSetting {
	value: TextChannel | 'none';
}

export interface IWebhookSetting extends IBaseSetting {
	value: Webhook | 'none';
}

export interface IBaseCategory {
	name: string;
	description: string;
}

export interface IGeneralCategory extends IBaseCategory{
	settings: IGeneralSettings;
}

export interface ILogCategory extends IBaseCategory{
	settings: ILogSettings;
}

export interface IGuildSettingsSchema {
	guildName: string;
	guildId: string;
	categories: {
		general: IGeneralCategory
		logging: ILogCategory
	};
}

export interface IGeneralSettings {
	embedColor: IColorSetting;
	disabledCommands: IDisableCommandsSetting;
}

export interface ILogSettings {
	enabled: IBooleanSetting;
	logChannel: ITextChannelSetting;
	editWebhook: IWebhookSetting;
	deleteWebhook: IWebhookSetting;
}

const guildSettingsSchema = new Schema<IGuildSettingsSchema>({
	guildName: {
		type: String,
		required: true,
	},
	guildId: {
		type: String,
		required: true,
		unique: true,
	},
	categories: {
		general: {
			type: {
				name: String,
				description: String,
				settings: <IGeneralSettings>{},
			},
			required: true,
		},
		logging: {
			type: {
				name: String,
				description: String,
				settings: <ILogSettings>{},
			},
			required: true,
		},
	},
});

const GuildSettings = model<IGuildSettingsSchema>('Guildsettings', guildSettingsSchema);

export default GuildSettings;
