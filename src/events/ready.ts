import { Events } from "discord.js";
import { ShrimpEvent } from "../common/base";

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const { infoLogger } = client
		infoLogger.info(`Logged in as ${client.user?.tag}!`);
	}
} as ShrimpEvent