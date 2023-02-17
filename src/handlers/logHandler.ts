import { Container, format, loggers, transports } from "winston";
import ShrimpClient from "../common/classes/ShrimpClient";
import chalk from "chalk";
import { formatDate, formatTime } from "../utilityMethods";

export default function startLogger(client: ShrimpClient): Container {
	const { printf, timestamp, label, combine } = format;

	const consoleFormat = printf(({ message, timestamp, label}) => {
		return `${chalk.yellowBright(formatTime(timestamp))} | ${label} | ${message}`;
	});

	const fileFormat = printf(({ message, timestamp, label}) => {
		return `${formatTime(timestamp)} | ${label} | ${message}`;
	});

	function generateFormat(labelName: string, format: 'file' | 'console') {
		return combine(
			label({
				label: labelName
			}),
			timestamp(),
			format === 'file' ? fileFormat : consoleFormat
		)
	}

	loggers.add('info', {
		format: generateFormat(chalk.blue('info '), 'console'),
		transports: [
			new transports.Console()
		]
	});
	loggers.add('error', {
		format: generateFormat(chalk.red('error'), 'console'),
		transports: [
			new transports.Console(),
			new transports.File({
				filename: `./logs/error-${formatDate(Date.now(), '-')}.log`,
				format:  generateFormat('error', 'file'),
			})
		]
	});
	return loggers
}