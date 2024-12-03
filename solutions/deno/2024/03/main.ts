#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

const regex1 = /mul\((\d+),(\d+)\)/g;

function solvePt1(input_data: string, args?: string[]): number {
	const matches = input_data.matchAll(regex1);

	const muls = matches.map(([full, a, b]) => Number(a) * Number(b));

	return muls.reduce((acc, val) => acc + val, 0);
}

const regex2 = /(mul)\((\d+),(\d+)\)|(do|don't)\(\)/g;

function solvePt2(input_data: string, args?: string[]): number {
	const matches = input_data.matchAll(regex2);

	let sum = 0;
	let do_ = true;
	for (const match of matches) {
		if (match[1] === "mul" && do_) {
			sum += Number(match[2]) * Number(match[3]);
		} else if (match[4] === "do") {
			do_ = true;
		} else if (match[4] === "don't") {
			do_ = false;
		}
	}
	return sum;
}

runner(solvePt1, solvePt2);
