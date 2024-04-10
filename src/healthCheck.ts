import { Status } from 'discord.js';
import { client } from './index.js';

let exitCode: number;

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
		exitCode = 0;
		break;

	case Status.Disconnected:
		client.infoLogger.info(`Docker health: Client disconnected`);
		exitCode = 1;
		break;

	default:
		client.infoLogger.info(`Docker health: Client unhealthy`);
		exitCode = 1;
		break;
}

process.exit(exitCode);
