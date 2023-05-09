import { Webhook } from "discord.js";
import { Schema, model } from "mongoose";

export interface IGuildSettingsSchema {
	name: string,
	guildId: string
	logSettings: ILogSettings
}

interface ILogSettings {
	logChannel: string | null
	logDeletes: boolean
	editWebhook: Webhook | null
	deleteWebhook: Webhook | null
}

const guildSettingsSchema = new Schema<IGuildSettingsSchema>({
	name: {
		type: String,
		required: true
	},
	guildId: {
		type: String,
		required: true,
		unique: true
	},
	logSettings: {
		type: <ILogSettings>{},
		required: true
	}
});

const GuildSettings = model<IGuildSettingsSchema>('Guildsettings', guildSettingsSchema);

export default GuildSettings;
