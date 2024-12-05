#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function checkOrder(
	current: number,
	next: number,
	rules_subset: [number, number][],
): boolean {
	for (const [before, after] of rules_subset) {
		if (before === next && after === current) return false;
	}

	return true;
}

function checkUpdate(rules: [number, number][], update: number[]): boolean {
	for (let i = 0; i < update.length; i++) {
		const current = update[i];
		const rules_subset = rules.filter(
			([b, a]) => b === current || a === current,
		);

		for (let j = i; j < update.length; j++) {
			const next = update[j];
			if (!checkOrder(current, next, rules_subset)) {
				return false;
			}
		}
	}

	return true;
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data.split("\n");

	const rules = data
		.slice(0, data.indexOf(""))
		.map((rule) => rule.split("|").map(Number)) as [number, number][];

	const updates = data
		.slice(data.indexOf("") + 1, data.length)
		.map((update) => update.split(",").map(Number));

	console.error(rules);
	console.error(updates);

	let middle_sum = 0;
	for (const update of updates) {
		if (checkUpdate(rules, update)) {
			middle_sum += update[Math.floor(update.length / 2)];
			console.error("Update ok: ", update);
		} else {
			console.error("Update NOT ok: ", update);
		}
	}

	return middle_sum;
}

function fixUpdate(update: number[], rules: [number, number][]) {
	for (let i = 0; i < update.length; i++) {
		for (let j = 0; j < update.length - i - 1; j++) {
			const rules_subset = rules.filter(
				([b, a]) => b === update[j] || a === update[j],
			);
			if (!checkOrder(update[j], update[j + 1], rules_subset)) {
				const temp = update[j];
				update[j] = update[j + 1];
				update[j + 1] = temp;
			}
		}
	}
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data.split("\n");

	const rules = data
		.slice(0, data.indexOf(""))
		.map((rule) => rule.split("|").map(Number)) as [number, number][];

	const updates = data
		.slice(data.indexOf("") + 1, data.length)
		.map((update) => update.split(",").map(Number));

	let middle_sum = 0;

	for (const update of updates) {
		if (!checkUpdate(rules, update)) {
			console.error("Update NOT ok: ", update);
			fixUpdate(update, rules);
			console.error("        fixed: ", update);
			middle_sum += update[Math.floor(update.length / 2)];
		}
	}

	return middle_sum;
}

runner(solvePt1, solvePt2);
