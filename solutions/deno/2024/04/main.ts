#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function search(data: string[][]): [string[], string[], string[], string[]] {
	const [rows, cols] = [data.length, data[0].length];

	const linesLR = [];
	for (let y = 0; y < rows; y += 1) {
		let line = "";
		for (let x = 0; x < cols; x += 1) {
			line += data[y][x];
		}
		linesLR.push(line);
	}

	const linesUD = [];
	for (let x = 0; x < cols; x += 1) {
		let line = "";
		for (let y = 0; y < rows; y += 1) {
			line += data[y][x];
		}
		linesUD.push(line);
	}

	const linesD1 = [];
	for (let x = -cols; x < cols; x += 1) {
		let line = "";
		for (let y = 0; y < rows; y += 1) {
			if (x + y >= 0 && x + y < cols) line += data[y][x + y];
		}
		linesD1.push(line);
	}

	const linesD2 = [];
	for (let x = 0; x < cols * 2; x += 1) {
		let line = "";
		for (let y = 0; y < rows; y += 1) {
			if (x - y >= 0 && x - y < cols) line += data[y][x - y];
		}
		linesD2.push(line);
	}

	return [linesLR, linesUD, linesD1, linesD2];
}

const count = (str: string, re: RegExp): number =>
	((str || "").match(re) || []).length;

const reverrseStrArr = (arr: string[]): string[] =>
	arr.map((x) => x.split("").reverse().join(""));

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data.split("\n").map((x) => x.split(""));

	const [linesLR, linesUD, linesD1, linesD2] = search(data);
	const allLines = [
		...linesLR,
		...reverrseStrArr(linesLR),
		...linesUD,
		...reverrseStrArr(linesUD),
		...linesD1,
		...reverrseStrArr(linesD1),
		...linesD2,
		...reverrseStrArr(linesD2),
	];

	const c = allLines.map((x) => count(x, /XMAS/g)).reduce((a, b) => a + b, 0);

	return c;
}

function compareArr(arr1: string[], arr2: string[]): boolean {
	if (arr1.length !== arr2.length) return false;
	for (let i = 0; i < arr1.length; i += 1) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data.split("\n").map((x) => x.split(""));

	// M.S | S.M | M.M | S.S |
	// .A. | .A. | .A. | .A. |
	// M.S | S.M | S.S | M.M |

	// basic pattern
	// /M.S\n.A.\nM.S|S.M\n.A.\nS.M|S.S\n.A.\nM.M|M.M\n.A.\nS.S/g;
	// cool pattern with conditional regex (not supported in JS)
	// /((M)|S).((M)?|S)\n.A.\n(?(4)S|M).(?(2)S|M)/g
	// recursive pattern
	// /[M|S].[M|S]\n.A.\n(?:(?<=S\n.A.\n)M|(?<=M\n.A.\n)S).(?:(?<=S..\n.A.\n..)M|(?<=M..\n.A.\n..)S)/g

	const pattern = /M.S\n.A.\nM.S|S.M\n.A.\nS.M|S.S\n.A.\nM.M|M.M\n.A.\nS.S/g;

	let c = 0;
	for (let x = 1; x < data[0].length - 1; x += 1) {
		for (let y = 1; y < data.length - 1; y += 1) {
			const subStr = [
				data[y - 1].slice(x - 1, x + 2).join(""),
				data[y].slice(x - 1, x + 2).join(""),
				data[y + 1].slice(x - 1, x + 2).join(""),
			].join("\n");

			if (subStr.match(pattern)) c++;
		}
	}

	return c;
}

runner(solvePt1, solvePt2);
