import { Events } from "discord.js";
import { ShrimpEvent } from "../common/base";
import GuildSettings, { IGuildSettingsSchema } from "../models/guildSettings";

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const { infoLogger } = client
		infoLogger.info(`Logged in as ${client.user?.tag}!`);

		for (const guild of client.guilds.cache) {
			if (await GuildSettings.exists({ guildId: guild[1].id })) {
				return;
			}

			const guildSettings = await GuildSettings.create(<IGuildSettingsSchema>{
				name: guild[1].name,
				guildId: guild[1].id,
				logSettings: {
					logChannel: null,
					logDeletes: false,
					editWebhook: null,
					deleteWebhook: null
				}
			});

			infoLogger.info(`MongoDB: Added Guildsettings for ${guildSettings.name}`)
		}
	}
} as ShrimpEvent