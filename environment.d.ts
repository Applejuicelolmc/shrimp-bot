// This ensures your .env variables are the right type and are available for typescript autocomplete

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			MONGO_DB_URI: string;
			CLIENT_ID: string;
			DEV_GUILD_ID: string;
			ENVIRONMENT: 'production' | 'development';
		}
	}
}

export {};