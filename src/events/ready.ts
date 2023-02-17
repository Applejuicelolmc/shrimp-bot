import ShrimpEvent from "../common/interfaces/KannaEvent";

export default {
	name: 'ready',
	once: true,
	async execute(client) {
		const { infoLogger } = client
		infoLogger.info(`Logged in as ${client.user?.tag}!`);
	}
} as ShrimpEvent