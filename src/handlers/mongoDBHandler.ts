import mongoose from 'mongoose';
import { ShrimpClient } from '../common/base';
import { Colors, Guild } from 'discord.js';
import GuildSettings, { IGuildSettingsSchema } from '../models/guildSettings';

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

		const start = Date.now();

		mongoose.connection.on('error', (error) => {
			client.infoLogger.error(`MongoDB - ${error}`);
		});

		mongoose.connection.on('disconnected', () => {
			const end = Date.now();

			client.infoLogger.error(`MongoDB - Disconnected from database: this lasted ${((end - start) / 1000) * 60}minutes`);
		});

		mongoose.connection.on('reconnected', () => {
			client.infoLogger.error(`MongoDB - Reconnected to the database`);
		});
	} catch (error) {
		client.handleError('MongoDB', error as Error);
	}
}

export async function generateDefaultSettings(guild: Guild): Promise<IGuildSettingsSchema> {
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

export async function updateDB(guild: Guild): Promise<void> {
	//TODO Add function to update guildSettings in case new settings are added, keeping original settings as they were before

	const oldGuildSettings = (await GuildSettings.findOne({ guildId: guild.id })) as IGuildSettingsSchema;

	console.log(oldGuildSettings.categories.general);
}
