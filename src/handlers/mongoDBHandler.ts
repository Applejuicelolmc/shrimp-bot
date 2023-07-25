import mongoose from 'mongoose';
import { ShrimpClient } from '../common/base';

export default async function DBHandler(client: ShrimpClient): Promise<void> {
	const { commands, categories, infoLogger, errorLogger, paths } = client;
	const uri = process.env.MONGO_DB_URI!;

	try {
		await mongoose.connect(uri)
		infoLogger.info(`MongoDB: Connected to the database`);

		mongoose.connection.on('error', error => {
			infoLogger.error(error);
		});

		mongoose.connection.on('disconnected', error => {
			infoLogger.error(`MongoDB: Disconnected from database: ${error}`);
		});
	} catch (error) {
		if (error instanceof Error) {
			errorLogger.error(`MongoDB: ${error.message}`);
		} else {
			errorLogger.error(`MongoDB: ${error}`);
		}
	}
}