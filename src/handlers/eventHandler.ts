import { readdir } from 'fs/promises';
import { ShrimpClient, ShrimpEvent } from '../common/base';

export default async function eventHandler(client: ShrimpClient): Promise<void> {
	async function fetchEvents(): Promise<string[]> {
		try {
			const eventFolder = await readdir(client.paths.events);
			return eventFolder.filter((file) => {
				return file.endsWith('.ts');
			});
		} catch (error) {
			client.handleError('Fetching events', error as Error);
			return [];
		}
	}

	async function loadEvents(events: string[]): Promise<void> {
		try {
			for (const eventFile of events) {
				const event = (await import(`${client.paths.events}/${eventFile}`)).default as ShrimpEvent;

				if (event.name === 'debug' && process.env.ENVIRONMENT === 'production') {
					continue;
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
		} catch (error) {
			client.handleError('Loading events', error as Error);
		}
	}

	function runProcessEvents(): void {
		try {
			process.on('SIGINT', () => {
				try {
					process.exit(0);
				} catch (error) {
					client.handleError('SIGINT event', error as Error);
				}
			});

			process.on('SIGTERM', () => {
				try {
					client.infoLogger.info('SIGTERM Received!');
				} catch (error) {
					client.handleError('SIGTERM event', error as Error);
				}
			});

			process.on('SIGQUIT', () => {
				try {
					client.infoLogger.info('SIGQUIT Received!');
				} catch (error) {
					client.handleError('SIGQUIT event', error as Error);
				}
			});

			process.on('warning', (warning) => {
				try {
					if (warning.stack) {
						const messageArray = warning.stack.split(/\n/g);

						for (const message of messageArray) {
							client.warningLogger.info(`${message}`);
						}
					}

					client.warningLogger.info(`${warning.message}`);
				} catch (error) {
					client.handleError('Warning event', error as Error);
				}
			});

			process.on('exit', (exitCode) => {
				try {
					client.destroy();

					if (exitCode === 0) {
						return client.infoLogger.info('Logged off');
					} else {
						return client.infoLogger.error(`Logged off with exit code ${exitCode}`);
					}
				} catch (error) {
					client.handleError('Exit event', error as Error);
				}
			});

			process.on('uncaughtException', (uncaughtException) => {
				try {
					client.handleError('Uncaught Exception', uncaughtException);
				} catch (error) {
					client.handleError('uncaughtException event', error as Error);
				}
			});
		} catch (error) {
			client.handleError('Process event', error as Error);
		}
	}

	try {
		runProcessEvents();
		await loadEvents(await fetchEvents());
	} catch (error) {
		client.handleError('Event handler', error as Error);
	}
}
