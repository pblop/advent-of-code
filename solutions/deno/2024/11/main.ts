#!/usr/bin/env deno run --v8-flags=--max-old-space-size=8000

import { runner } from "../../../../lib/deno.ts";

function applyRules(stones: number[]) {
	const newStones = [];
	for (const stone of stones) {
		if (stone === 0) {
			newStones.push(1);
		} else {
			const numDigits = Math.floor(Math.log10(stone) + 1);
			if (numDigits % 2 === 0) {
				const halfDivisor = 10 ** Math.floor(numDigits / 2);
				newStones.push(Math.floor(stone / halfDivisor));
				newStones.push(stone % halfDivisor);
			} else {
				newStones.push(stone * 2024);
			}
		}
	}
	return newStones;
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data.split(" ").map(Number);

	let stones = data;
	console.error(`Stones: ${stones}`);
	for (let i = 0; i < 25; i++) {
		stones = applyRules(stones);
		console.error(`Stones: ${stones}`);
	}

	return stones.length;
}

function getOrZero(map: Map<number, number>, key: number): number {
	return map.get(key) ?? 0;
}
function addToKey(map: Map<number, number>, key: number, value: number) {
	map.set(key, getOrZero(map, key) + value);
}

function applyRulesFast(numEach: Map<number, number>): Map<number, number> {
	const newNumEach: Map<number, number> = new Map();

	for (const [marking, count] of Array.from(numEach.entries())) {
		// console.error(`Marking: ${marking}, Count: ${count}`);
		if (marking === 0) {
			addToKey(newNumEach, 1, count);
		} else {
			const numDigits = Math.floor(Math.log10(marking) + 1);
			if (numDigits % 2 === 0) {
				const halfDivisor = 10 ** Math.floor(numDigits / 2);
				addToKey(newNumEach, Math.floor(marking / halfDivisor), count);
				addToKey(newNumEach, marking % halfDivisor, count);
			} else {
				addToKey(newNumEach, marking * 2024, count);
			}
		}
	}

	return newNumEach;
}

function solvePt2(input_data: string, args?: string[]): bigint {
	const data = input_data.split(" ").map(Number);

	let numEach: Map<number, number> = new Map();
	for (const stone of data) {
		addToKey(numEach, stone, 1);
	}

	const calcLength = (x: Map<number, number>) =>
		x.values().reduce((acc, val) => acc + BigInt(val), 0n);

	for (let i = 0; i < 75; i++) {
		numEach = applyRulesFast(numEach);
	}

	return calcLength(numEach);
}

runner(solvePt2, solvePt2);
