#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function findGuard(data: string[][]): [number, number, number, number] {
	for (let y = 0; y < data.length; y++) {
		for (let x = 0; x < data[y].length; x++) {
			// Only one needed
			if (data[y][x] === "^") {
				return [y, x, -1, 0];
			}
			// The rest are for testing.
			if (data[y][x] === ">") {
				return [y, x, 0, 1];
			}
			if (data[y][x] === "v") {
				return [y, x, 1, 0];
			}
			if (data[y][x] === "<") {
				return [y, x, 0, -1];
			}
		}
	}

	throw new Error("Guard not found");
}

function print(data: string[][], positions: [number, number][]): void {
	for (let y = 0; y < data.length; y++) {
		let row = "";
		for (let x = 0; x < data[y].length; x++) {
			if (positions.some(([px, py]) => px === x && py === y)) {
				row += "X";
			} else {
				row += data[y][x];
			}
		}
		console.error(row);
	}
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data
		.trim()
		.split("\n")
		.map((x) => x.split(""));

	const [rows, cols] = [data.length, data[0].length];
	let [y, x, dy, dx] = findGuard(data);
	// let [dx, dy] = [0, -1];
	const positions: [number, number][] = [];

	// Move!
	while (true) {
		// Bounds
		if (x < 0 || x >= cols || y < 0 || y >= rows) break;
		positions.push([x, y]);

		const [nx, ny] = [x + dx, y + dy];
		// Check if we wil hit a wall
		if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && data[ny][nx] === "#") {
			// Turn right
			[dx, dy] = [-dy, dx];
		} else {
			// Move forward
			[x, y] = [nx, ny];
		}
	}

	const set_positions = new Set(positions.map(([x, y]) => `${x},${y}`));

	// Marked positions
	// print(data, positions);

	// return 0;
	return set_positions.size;
}

const allPositions = new Set<string>();

function findLoop(
	x_: number,
	y_: number,
	dx_: number,
	dy_: number,
	ox: number,
	oy: number,
	data: string[][],
): boolean {
	const positions: [number, number][] = [];
	const [rows, cols] = [data.length, data[0].length];
	let [y, x, dy, dx] = [y_, x_, dy_, dx_];

	// Move!
	let loop = 0;
	while (true) {
		// Bounds
		if (x < 0 || x >= cols || y < 0 || y >= rows) break;
		// console.error(positions, [x, y]);
		// print(data, positions);

		// Found a loop
		if (
			positions.some(
				([px, py], i) => px === x && py === y && i !== positions.length - 1,
			)
		)
			loop++;
		else loop = 0;

		if (loop === 10) return true;

		positions.push([x, y]);
		allPositions.add(`${x},${y}`);

		const [nx, ny] = [x + dx, y + dy];
		// Check if we wil hit a wall
		if (
			nx >= 0 &&
			nx < cols &&
			ny >= 0 &&
			ny < rows &&
			(data[ny][nx] === "#" || (ny === oy && nx === ox))
		) {
			// Turn right
			[dx, dy] = [-dy, dx];
		} else {
			// Move forward
			[x, y] = [nx, ny];
		}
	}

	return false;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data
		.trim()
		.split("\n")
		.map((x) => x.split(""));
	const [rows, cols] = [data.length, data[0].length];
	const [y, x, dy, dx] = findGuard(data);

	let loops = 0;
	// Populate all positions
	findLoop(x, y, dx, dy, -100, -100, data);

	for (let i = 0; i < allPositions.size; i++) {
		Deno.stderr.writeSync(
			new TextEncoder().encode(`i=${i}/size=${allPositions.size}\n`),
		);
		const [px, py] = Array.from(allPositions)[i].split(",").map(Number);
		if (
			px >= 0 &&
			px < cols &&
			py >= 0 &&
			py < rows &&
			findLoop(x, y, dx, dy, px, py, data)
		) {
			loops++;
		}
	}

	// for (let oy = 0; oy < rows; oy++) {
	// 	// console.error("Checking row: ", oy);
	// 	Deno.stdout.writeSync(new TextEncoder().encode(`Checking row: ${oy}\n`));
	// 	for (let ox = 0; ox < cols; ox++) {
	// 		Deno.stdout.writeSync(new TextEncoder().encode(`Checking col: ${ox}\n`));
	// 		if (data[oy][ox] === ".") {
	// 			if (findLoop(x, y, dx, dy, ox, oy, data)) {
	// 				console.error("Found loop at: ", ox, oy);
	// 				loops++;
	// 			}
	// 		}
	// 	}
	// }

	return loops;
}

runner(solvePt1, solvePt2);
