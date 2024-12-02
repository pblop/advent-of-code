#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function extractLists(input_data: string): [number[], number[]] {
	const lines = input_data.split("\n");
	const list1 = [];
	const list2 = [];

	for (const line of lines) {
		const split = line.split("   ");
		list1.push(Number(split[0]));
		list2.push(Number(split[1]));
	}

	return [list1, list2];
}

// Problem 1: calculate the distances
function solvePt1(input_data: string, args?: string[]): number {
	const [listL, listR] = extractLists(input_data);

	const sortedL = listL.sort((a, b) => a - b);
	const sortedR = listR.sort((a, b) => a - b);

	const dists = [];
	for (let i = 0; i < sortedL.length; i++) {
		dists.push(Math.abs(sortedL[i] - sortedR[i]));
	}

	const sum = dists.reduce((acc, val) => acc + val, 0);

	return sum;
}

// Problem 2: calculate the similarity score
function solvePt2(input_data: string, args?: string[]): number {
	const [listL, listR] = extractLists(input_data);

	const similarities = listL.map((x) => {
		const appearancesR = listR.filter((y) => y === x).length;
		return x * appearancesR;
	});

	const sum = similarities.reduce((acc, val) => acc + val, 0);

	return sum;
}

runner(solvePt1, solvePt2);
