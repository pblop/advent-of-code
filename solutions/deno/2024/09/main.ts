#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function repeatArr<T>(x: T, length: number): T[] {
	return Array(length).fill(x);
}

function solvePt1(input_data: string, args?: string[]): number {
	const compacted = input_data.split("").map(Number);

	// biome-ignore format: better-looking
	const real = compacted
		// biome-ignore lint/style/noParameterAssign: it's needed!
		.flatMap(((acc) => (n, i) => repeatArr(i % 2 === 0 ? acc++ : null, n))(0));

	let sum = 0;
	let str = "";
	for (let i = 0, end = real.length; i < end; i++) {
		while (real[end - 1] == null) end--;

		const n = real[i] == null ? real[--end] : real[i];
		if (i >= end) break;
		// console.log(`i=${i}, end=${end}. real[i]=${real[i]}, real[end-1]=${real[end]}. n=${n}`);

		if (n == null) throw new Error("n is null!!1!");
		sum += n * i;
		str += n;
	}
	console.log(str);

	return sum;
}

type FileID = number | null;
type FileEntry = { id: FileID; size: number };

function printReal(real: FileEntry[]): void {
	console.log(real.map((x) => `${x.id === null ? "." : x.id}`.repeat(x.size)).join(""));
}
function solvePt2(input_data: string, args?: string[]): number {
	const compacted = input_data.split("").map(Number);

	// biome-ignore format: better-looking
	const real: FileEntry[] = compacted
		// biome-ignore lint/style/noParameterAssign: it's needed!
		.map(((acc) => (n, i) => ({id: i % 2 === 0 ? acc++ : null, size: n}))(0))
		.filter((x) => x.size > 0)
		.toReversed();

	for (let i = 0; i < real.length; i++) {
		const eli = real[i];
		if (eli.id === null) continue;

		for (let j = real.length - 1; j > i; j--) {
			const elj = real[j];
			// we need an empty space with at least eli.size free
			if (elj.id === null && elj.size >= eli.size) {
				// we add at the end, the modify the remaining space to be current-its size.
				elj.size -= eli.size;

				real.splice(j + 1, 0, eli);
				if (elj.size === 0) real.splice(j, 1);
				real[i] = { id: null, size: eli.size };
				break;
			}
		}
	}

	real.reverse();
	let sum = 0;
	let i = 0;
	for (let j = 0; j < real.length; j++) {
		const el = real[j];

		for (let k = 0; k < el.size; k++) {
			const n = el.id === null ? 0 : el.id;
			// console.log(`el.id=${el.id}, i=${i}`);
			sum += n * i;
			i++;
		}
	}

	return sum;
}

runner(solvePt1, solvePt2);
