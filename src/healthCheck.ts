import { Status } from 'discord.js';
import { client } from '.';

switch (client.ws.status) {
	case Status.Idle:
	case Status.Ready:
	case Status.Resuming:
	case Status.Connecting:
	case Status.Identifying:
	case Status.Reconnecting:
	case Status.WaitingForGuilds:
	case Status.Nearly:
		client.infoLogger.info(`Docker health: Client Healthy`);
		process.exit(0);

	case Status.Disconnected:
		client.infoLogger.info(`Docker health: Client disconnected`);
		process.exit(1);
}
