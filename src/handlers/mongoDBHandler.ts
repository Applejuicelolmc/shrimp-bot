import mongoose from 'mongoose';
import { client } from '../index.js';
import { Colors, Guild } from 'discord.js';
import { ShrimpClient } from '../common/base.js';
// import { formatTime } from '../common/utilityMethods.js';
import GuildSettings, {
	IBooleanSetting,
	IColorSetting,
	IDisableCommandsSetting,
	IGeneralCategory,
	IGuildSettingsSchema,
	ILogCategory,
	IWebhookSetting,
} from '../models/guildSettings.js';

export type dbCategories = {
	general: IGeneralCategory;
	logging: ILogCategory;
};

export type settingTypes =
	| emdedColorUpdateSetting
	| disabledCommandsUpdateSetting
	| enabledUpdateSetting
	| logChannelUpdateSetting
	| editWebhookUpdateSetting
	| deleteWebhookUpdateSetting;

export type settingPathsType = {
	embedColor: string;
	disabledCommands: string;
	enabled: string;
	logChannel: string;
	editWebhook: string;
	deleteWebhook: string;
};

export const settingPaths: settingPathsType = {
	embedColor: 'categories.general.settings.embedColor.value',
	disabledCommands: 'categories.general.settings.disabledCommands.value',
	enabled: 'categories.logging.settings.enabled.value',
	logChannel: 'categories.logging.settings.logChannel.value',
	editWebhook: 'categories.logging.settings.editWebhook.value',
	deleteWebhook: 'categories.logging.settings.deleteWebhook.value',
};

type updateSetting =
	| emdedColorUpdateSetting
	| disabledCommandsUpdateSetting
	| enabledUpdateSetting
	| logChannelUpdateSetting
	| editWebhookUpdateSetting
	| deleteWebhookUpdateSetting;

export type emdedColorUpdateSetting = IColorSetting['value'];

export type disabledCommandsUpdateSetting = IDisableCommandsSetting['value'];

export type enabledUpdateSetting = IBooleanSetting['value'];

export type logChannelUpdateSetting = IWebhookSetting['value'];

export type editWebhookUpdateSetting = IWebhookSetting['value'];

export type deleteWebhookUpdateSetting = IColorSetting['value'];

export const testGuild = {
	id: 'testGuild',
	name: 'Test Guild',
} as Guild;

export default async function DBHandler(client: ShrimpClient): Promise<void> {
	const uri = process.env.MONGO_DB_URI!;

	try {
		await mongoose.connect(uri, {
			family: 4,
			connectTimeoutMS: 300000,
			serverSelectionTimeoutMS: 300000,
			minHeartbeatFrequencyMS: 5000,
		});

		client.infoLogger.info(`MongoDB: Connected to the database`);

		// const start = Date.now();

		// TODO: Something broke here, fix it

		// mongoose.connection.on('error', (error: Error) => {
		// 	client.infoLogger.error(`MongoDB - ${error}`);
		// });

		// mongoose.connection.on('disconnected', () => {
		// 	const end = Date.now();

		// 	client.infoLogger.error(`MongoDB - Disconnected from database (Connected for ${formatTime(end - start)})`);
		// });

		// mongoose.connection.on('reconnected', () => {
		// 	client.infoLogger.error(`MongoDB - Reconnected to the database`);
		// });
	} catch (error) {
		client.handleError('MongoDB', error as Error);
	}
}

export async function generateDefaultSettings(guild: Guild): Promise<IGuildSettingsSchema> {
	client.infoLogger.info(`MongoDB - Adding default Guildsettings for ${guild.name}`);

	return await GuildSettings.create(<IGuildSettingsSchema>{
		guildName: guild.name,
		guildId: guild.id,
		categories: {
			general: {
				name: 'General settings',
				description: `Some basic settings`,
				settings: {
					embedColor: {
						fullName: 'Embed color',
						description: 'The color that each of my embeds will use for this server',
						value: Colors.Aqua,
					},
					disabledCommands: {
						fullName: 'Disabled commands',
						description: 'Commands that are disabled in this server',
						value: 'none',
					},
				},
			},
			logging: {
				name: 'Logging settings',
				description: `Settings for the logging/moderating of messages`,
				settings: {
					enabled: {
						fullName: 'Logging enabled',
						description: 'Whether or not logging of message edits/deletes is enabled in this server',
						value: false,
					},
					logChannel: {
						fullName: 'Log channel',
						description: 'The Channel to be used for logging',
						value: 'none',
					},
					editWebhook: {
						fullName: 'Edit Webhook',
						description: 'The webhook used for logging message edits',
						value: 'none',
					},
					deleteWebhook: {
						fullName: 'Delete Webhook',
						description: 'The webhook used for logging message deletes',
						value: 'none',
					},
				},
			},
		},
	});
}

export async function updateDB(guild: Guild, settingPath: string, settingValue: settingTypes): Promise<void> {
	//TODO: Add function to update guildSettings in case new settings are added, keeping original settings as they were before

	if (await GuildSettings.exists({ guildId: guild.id })!) {
		await generateDefaultSettings(guild);
	}

	const oldGuildSettings = await GuildSettings.findOne({ guildId: guild.id });

	if (!oldGuildSettings) {
		client.errorLogger.error(`MongoDB - Guild settings were not found in the database.`);
		return;
	}

	const oldGuildSettingValue = [settingPath];

	await oldGuildSettings.updateOne({
		$set: {
			[settingPath]: settingValue, // Y does path only work in array 🤔
		},
	});

	client.infoLogger.info(`MongoDB - Updated Guildsettings for ${guild.name} \n[${settingPath}]: ${oldGuildSettingValue} -> ${settingValue}`);
	return;
}
