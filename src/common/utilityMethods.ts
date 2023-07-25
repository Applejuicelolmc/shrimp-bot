export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capitalize(string: string): string {
	return `${string[0].toUpperCase()}${string.slice(1)}`;
}

export function formatDate(date: number, separator: string): string {
	if (!date || !separator) {
		throw new Error('Missing date or separator argument');
	}

	const currentDate = new Date(date);
	return `${currentDate.getFullYear()}${separator}${currentDate.getMonth() + 1}${separator}${currentDate.getUTCDate()}`;
}

export function formatTime(time: number, locale = undefined ): string {
	const currentTime = new Date(time);
	const formattedTime = currentTime.toLocaleString(locale, {
		hourCycle:'h23',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	return formattedTime;
}