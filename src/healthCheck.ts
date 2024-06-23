import fs from 'fs';

(async function healthCheck(): Promise<void> {
	let exitCode: number;

	const unhealthy = fs.existsSync('config/unhealthy');

	if (unhealthy) {
		console.log(`Docker health: Client unhealthy`);
		exitCode = 1;
	} else {
		console.log(`Docker health: Client Healthy`);
		exitCode = 0;
	}

	try {
		process.exit(exitCode);
	} catch (error) {
		console.log('error: ', error);
		process.exit(1);
	}
})();
