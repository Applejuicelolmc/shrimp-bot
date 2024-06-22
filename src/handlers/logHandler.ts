import chalk from 'chalk';
import { formatDate, formatTime } from '../common/utilityMethods.ts';
import winston, { Container, format, loggers, transports } from 'winston';

export default function startLogger(): Container {
	const { printf, timestamp, label, combine } = format;

	const consoleFormat = printf(({ message, timestamp, label }) => {
		return `${chalk.cyan(formatTime(timestamp))} | ${label} | ${message}`;
	});

	const fileFormat = printf(({ message, timestamp, label }) => {
		return `${formatTime(timestamp)} | ${label} | ${message}`;
	});

	function generateFormat(labelName: string, format: winston.Logform.Format) {
		return combine(
			label({
				label: labelName,
			}),
			timestamp(),
			format
		);
	}

	loggers.add('info', {
		format: generateFormat(chalk.blue('info '), consoleFormat),
		transports: [new transports.Console()],
	});

	loggers.add('debug', {
		format: generateFormat(chalk.magentaBright('debug'), consoleFormat),
		transports: [new transports.Console()],
	});

	loggers.add('warning', {
		format: generateFormat(chalk.yellowBright('warn '), consoleFormat),
		transports: [new transports.Console()],
	});

	loggers.add('error', {
		format: generateFormat(chalk.red('error'), consoleFormat),
		transports: [
			new transports.Console(),
			new transports.File({
				filename: `./logs/error-${formatDate(Date.now(), '-')}.log`,
				format: generateFormat('error', fileFormat),
			}),
		],
	});

	return loggers;
}
