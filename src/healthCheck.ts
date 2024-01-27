import { Status } from 'discord.js';
import { client } from '.';

switch (client.ws.status) {
	case Status.Idle:
	case Status.Ready:
	case Status.Resuming:
	case Status.Connecting:
	case Status.Reconnecting:
		process.exit(0);
	case Status.Disconnected:
		process.exit(1);

	default:
		process.exit(1);
}
