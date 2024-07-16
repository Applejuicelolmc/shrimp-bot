import { readdir } from 'fs/promises';
import { sleep } from '../common/utilityMethods.js';
import { ShrimpClient, ShrimpEvent } from '../common/base.js';
import { Colors, EmbedBuilder, bold } from 'discord.js';

export default async function eventHandler(client: ShrimpClient): Promise<void> {
	async function fetchEvents(): Promise<string[]> {
		try {
			const eventFolder = await readdir(client.paths.events);
			return eventFolder.filter((file) => {
				return file.endsWith('.js');
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

				if (event.name === 'messageCreate' || event.name === 'messageUpdate' || event.name === 'messageDelete') {
					continue; // Disabled these events as they require the message content Gateway Intent which is not enabled now
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
		let timesSent = 0;

		try {
			process.on('SIGINT', async () => {
				if (timesSent < 1) {
					timesSent += 1;
					client.infoLogger.info(`Got ctrl-c\`d :c (PID: ${process.pid})`);

					client.user?.setPresence(client.logOutPresence);

					await client.alertWebhook.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
								.addFields({
									name: `Event:`,
									value: `Logged off (PID: ${process.pid})`,
								})
								.setColor(Colors.Orange),
						],
					});
				}

				await sleep(1000);

				process.exit(0);
			});

			process.on('SIGTERM', async () => {
				client.infoLogger.info('Container got shut down');

				client.user?.setPresence(client.logOutPresence);

				await client.alertWebhook.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${bold(`INFO | <t:${Math.round(Date.now() / 1000)}:R>`)}`)
							.addFields({
								name: `Event:`,
								value: `Logged off (PID: ${process.pid})`,
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
					client.infoLogger.info(`Logged off (PID: ${process.pid})`);
				} else {
					client.infoLogger.error(`Logged off with exit code ${exitCode} (PID: ${process.pid})`);
				}

				return await client.destroy();
			});

			process.on('uncaughtException', (uncaughtException) => {
				client.handleError('Uncaught Exception', uncaughtException as Error);
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
