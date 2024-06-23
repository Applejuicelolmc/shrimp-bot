// This ensures your .env variables are the right type and are available for typescript autocomplete

import { Snowflake } from 'discord.js';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			OPENAI_TOKEN: string;
			MONGO_DB_URI: string;
			CLIENT_ID: string;
			DEV_ID: string;
			DEV_GUILD_ID: string;
			ALERT_WEBHOOK_URL: string;
			ENVIRONMENT: 'production' | 'development';
		}
	}
}

export {};
