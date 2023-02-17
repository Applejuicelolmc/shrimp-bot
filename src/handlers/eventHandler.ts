import { readdir } from "fs/promises";
import { sleep } from "../utilityMethods";
import ShrimpClient from "../common/classes/ShrimpClient";
import ShrimpEvent from "../common/interfaces/KannaEvent";

export default async function eventHandler(client: ShrimpClient): Promise<void> {
	const { paths, infoLogger, errorLogger } = client;

	try {
		process.on('SIGINT', () => {
			process.exit(0)
		});
	
		process.on('SIGTERM', () => {
			infoLogger.info('SIGTERM Received!');
		});
	
		process.on('SIGQUIT' , () => {
			infoLogger.info('SIGQUIT Received!');
		});
	
		process.on('exit', (exitCode) => {
			sleep(500);
			if (exitCode === 0) {
				infoLogger.info('Logged off');
			} else {
				infoLogger.error(`Logged off with exit code ${exitCode}`);
			}
	
			return client.destroy();
		});
	
		async function fetchEvents(): Promise<string[]>{
			const eventFolder =  await readdir(paths.events);
			return eventFolder.filter(file => {
				return file.endsWith('.ts');
			});
		}
	
		const events = await fetchEvents();
	
		for (const eventFile of events) {
			const event =  require(`${paths.events}/${eventFile}`).default as ShrimpEvent;
	
			if (event.name === 'debug') {
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
		if (error instanceof Error) {
			errorLogger.error(`Event handler: ${error.message}`);
		} else {
			errorLogger.error(`Event handler: ${error}`);
		}
	}
}