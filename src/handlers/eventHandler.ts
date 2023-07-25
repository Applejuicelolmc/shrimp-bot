import { readdir } from 'fs/promises';
import { ShrimpClient, ShrimpEvent } from '../common/base';
import { sleep } from '../common/utilityMethods';

export default async function eventHandler(client: ShrimpClient): Promise<void> {
	const { paths, infoLogger, errorLogger } = client;

	async function fetchEvents(): Promise<string[]>{
		const eventFolder =  await readdir(paths.events);
		return eventFolder.filter(file => {
			return file.endsWith('.ts');
		});
	}

	async function loadEvents(events: string[]) {
		for (const eventFile of events) {
			const event: ShrimpEvent =  require(`${paths.events}/${eventFile}`).default;
	
			if (event.name === 'debug') {
				continue; //ignore debug events for now...
			}
	
			if (event.once) {
				client.once(event.name, async (...args) => {
					await event.execute(client, ...args);
				});
			} else {
				client.on(event.name, async (...args) => {
					await event.execute(client, ...args);
				});
			}
		}
	}

	try {
		process.on('SIGINT', () => {
			process.exit(0);
		});

		process.on('SIGTERM', () => {
			infoLogger.info('SIGTERM Received!');
		});

		process.on('SIGQUIT' , () => {
			infoLogger.info('SIGQUIT Received!');
		});

		process.on('warning', (warning) => {
			infoLogger.info(`${warning.stack}`);
		})

		process.on('exit', (exitCode) => {
			sleep(500);
			if (exitCode === 0) {
				infoLogger.info('Logged off');
			} else {
				infoLogger.error(`Logged off with exit code ${exitCode}`);
			}

			return client.destroy();
		});

		loadEvents(await fetchEvents());
	} catch (error) {
		if (error instanceof Error) {
			errorLogger.error(`Event handler: ${error.message}`);
		} else {
			errorLogger.error(`Event handler: ${error}`);
		}
	}
