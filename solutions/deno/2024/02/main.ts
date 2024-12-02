#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function load2dArray<T>(
	inputData: string,
	separator = " ",
	// Default to identity function
	parseFunction: (x: string) => T = (x) => x as unknown as T,
): T[][] {
	return inputData
		.split("\n")
		.map((line) => line.split(separator).map(parseFunction));
}

const compare = (a: number, b: number) => (a > b ? 1 : a < b ? -1 : 0);

// function checkSafe(report: number[]): boolean {
// 	let inc: boolean | null = null;
// 	for (let i = 0; i < report.length - 1; i++) {
// 		const diff = report[i] - report[i + 1];
// 		const abs = Math.abs(diff);

// 		if (inc == null) inc = diff > 0;
// 		else if (inc !== diff > 0) return false;

// 		if (!(abs >= 1 && abs <= 3)) return false;
// 	}
// 	return true;
// }
function checkSafe(report: number[]): boolean {
	const dists = report
		.map((x, i) => (i === 0 ? -10000 : report[i - 1] - x))
		.slice(1);

	const gradual = dists.every(
		(x: number) => Math.abs(x) <= 3 && Math.abs(x) >= 1,
	);
	const increasing = dists.every((x: number) => x < 0);
	const decreasing = dists.every((x: number) => x > 0);

	return gradual && (increasing || decreasing);
}
function checkSafeAll(report: number[]): boolean {
	const reports = [report];
	for (let i = 0; i < report.length; i++) {
		const copy = report.filter((_, j) => i !== j);
		reports.push(copy);
	}
	return reports.some(checkSafe);
}

function solvePt1(input_data: string, args?: string[]): number {
	const arr = load2dArray<number>(input_data.trim(), " ", Number);
	let num = 0;
	for (let i = 0; i < arr.length; i++) {
		const safe = checkSafe(arr[i]);
		// console.log(arr[i], safe);
		if (safe) {
			num++;
		}
	}

	return num;
}

function solvePt2(input_data: string, args?: string[]): number {
	const arr = load2dArray<number>(input_data.trim(), " ", Number);
	let num = 0;
	for (let i = 0; i < arr.length; i++) {
		const safe = checkSafeAll(arr[i]);
		// console.log(arr[i], safe);
		if (safe) {
			num++;
		}
	}

	return num;
}

runner(solvePt1, solvePt2);
