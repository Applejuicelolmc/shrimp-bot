import { codeBlock } from 'discord.js';

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

export function formatTime(time: number, locale = undefined): string {
	return new Date(time).toLocaleString(locale, {
		hourCycle: 'h23',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
}

export function rollDice(dice: number): number {
	return Math.floor(Math.random() * dice) + 1;
}

export function generateDeck() {
	const deck: string[] = [];
	const suites = ['♥️', '♣️', '♠️', '♦️'] as const;
	const ranks = [' Ace ', '  2  ', '  3  ', '  4  ', '  5  ', '  6  ', '  7  ', '  8  ', '  9  ', ' 10  ', 'Jack ', 'Queen', 'King '] as const;

	for (const suite of suites) {
		for (const rank of ranks) {
			deck.push(codeBlock(`${suite} ${rank} ${suite}`));
		}
	}

	return deck;
}

export function shuffleArray(array: string[]): string[] {
	// Somehow found source on wikipedia after forgetting about it
	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle

	for (let i = array.length - 1; i > 0; i--) {
		// Totally didn't steal this from stackoverflow...

		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}
