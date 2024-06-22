import { Status } from 'discord.js';
import { client } from './index.ts';

let exitCode: number;

try {
	switch (client.ws.status) {
		case Status.Idle:
		case Status.Ready:
		case Status.Resuming:
		case Status.Connecting:
		case Status.Identifying:
		case Status.Reconnecting:
		case Status.WaitingForGuilds:
		case Status.Nearly:
			if (client.user) {
				client.infoLogger.info(`Docker health: Client Healthy`);
			} else {
				console.log(`Docker health: Client Healthy`);
			}

			exitCode = 0;
			break;

		case Status.Disconnected:
			if (client.user) {
				client.infoLogger.info(`Docker health: Client disconnected`);
			} else {
				console.log(`Docker health: Client disconnected`);
			}

			exitCode = 1;
			break;

		default:
			if (client.user) {
				client.infoLogger.info(`Docker health: Client unhealthy`);
			} else {
				console.log(`Docker health: Client unhealthy`);
			}

			exitCode = 1;
			break;
	}

	if (client.user) {
		client.infoLogger.info(`Docker health: Client status: ${client.ws.status}, process exit code: ${exitCode}`);
	} else {
		console.log(`Docker health: Client status: ${client.ws.status}, process exit code: ${exitCode}`);
	}

	process.exit(exitCode);
} catch (error) {
	client.handleError('Nuh uh', error as Error);
	process.exit(1);
}
