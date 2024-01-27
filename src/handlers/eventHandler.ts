import { readdir } from 'fs/promises';
import { ShrimpClient, ShrimpEvent } from '../common/base';
import { ActivityType, Colors, EmbedBuilder, bold } from 'discord.js';
import { sleep } from '../common/utilityMethods';

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
			process.on('SIGINT', async () => {
				client.infoLogger.info('Got ctrl-c`d :c');

				client.user?.setPresence({
					status: 'invisible',
					afk: false,
					activities: [
						{
							name: `Logging off`,
							type: ActivityType.Custom,
						},
					],
				});

				await client.alertWebhook.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
							.addFields({
								name: `Event:`,
								value: `Logged off`,
							})
							.setColor(Colors.Orange),
					],
				});

				await sleep(1000);

				process.exit(0);
			});

			process.on('SIGTERM', async () => {
				client.infoLogger.info('Container got shut down');

				client.user?.setPresence({
					status: 'invisible',
					afk: false,
					activities: [
						{
							name: `Logging off`,
							type: ActivityType.Custom,
						},
					],
				});

				await client.alertWebhook.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
							.addFields({
								name: `Event:`,
								value: `Logged off`,
							})
							.setColor(Colors.Orange),
					],
				});

				await sleep(1000);

				process.exit(0);
			});

			process.on('SIGQUIT', () => {
				client.infoLogger.info('SIGQUIT Received!');
			});

			process.on('warning', (warning) => {
				if (process.env.ENVIRONMENT === 'development' && warning.stack) {
					const messageArray = warning.stack.split(/\n/g);

					for (const message of messageArray) {
						client.warningLogger.info(`${message}`);
					}

					return;
				}

				return client.warningLogger.info(`${warning.message}`);
			});

			process.on('exit', async (exitCode) => {
				if (exitCode === 0) {
					client.infoLogger.info('Logged off');
				} else {
					client.infoLogger.error(`Logged off with exit code ${exitCode}`);
				}

				return await client.destroy();
			});

			process.on('uncaughtException', (uncaughtException) => {
				client.handleError('Uncaught Exception', uncaughtException);
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
