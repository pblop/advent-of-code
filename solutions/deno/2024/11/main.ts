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

function applyRulesFast(
	stones: BigUint64Array,
	length: number,
): [BigUint64Array, number] {
	const newStones = new BigUint64Array(length * 2);
	let newLength = 0;

	for (let i = 0; i < length; i++) {
		if (stones[i] === 0n) {
			newStones[newLength++] = 1n;
		} else {
			const numDigits = Math.floor(Math.log10(Number(stones[i])) + 1);
			if (numDigits % 2 === 0) {
				const halfDivisor = BigInt(10 ** Math.floor(numDigits / 2));
				newStones[newLength++] = stones[i] / halfDivisor;
				newStones[newLength++] = stones[i] % halfDivisor;
			} else {
				newStones[newLength++] = stones[i] * 2024n;
			}
		}
	}
	return [newStones, newLength];
}

function printStones(stones: BigUint64Array, length: number) {
	let str = "";
	for (let i = 0; i < length; i++) {
		str += `${stones[i]} `;
	}
	console.error(str);
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data.split(" ").map(BigInt);

	let stones = new BigUint64Array(data);
	let length = data.length;

	// printStones(stones, length);
	for (let i = 0; i < 75; i++) {
		[stones, length] = applyRulesFast(stones, length);
		console.error(`${i} ${length}`);
		// printStones(stones, length);
	}

	return length;
}

runner(solvePt1, solvePt2);
