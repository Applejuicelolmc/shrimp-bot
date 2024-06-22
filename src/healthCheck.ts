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
			console.log(`Docker health: Client Healthy`);

			exitCode = 0;
			break;

		case Status.Disconnected:
			console.log(`Docker health: Client disconnected`);

			exitCode = 1;
			break;

		default:
			console.log(`Docker health: Client unhealthy`);

			exitCode = 1;
			break;
	}

	process.exit(exitCode);
} catch (error) {
	console.log('error: ', error);
	process.exit(1);
}
