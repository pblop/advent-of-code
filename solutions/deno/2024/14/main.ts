#!/usr/bin/env deno run --allow-write

import { runner } from "../../../../lib/deno.ts";
import PNGlib from "npm:node-pnglib";

type Line = {
	p: [number, number];
	v: [number, number];
};

// https://stackoverflow.com/a/17323608
// % is remainder in JS, not modulo 🤦🏻‍♂️
function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data.split("\n").map((line) => {
		const matches = line.match(/p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/)!;
		return {
			p: [Number(matches[1]), Number(matches[2])],
			v: [Number(matches[3]), Number(matches[4])],
		};
	});

	const [W, H] = [101, 103];
	const TIME = 100;

	function display(data: [number, number][], drawMiddles = false) {
		const map = [...Array(H)].map(() => Array(W).fill(0));

		for (const [x, y] of data) map[y][x]++;

		for (let i = 0; i < H; i++) {
			let line = "";
			if (!drawMiddles && i === (H - 1) / 2) {
				line += "\n";
			} else {
				for (let j = 0; j < W; j++) {
					if (!drawMiddles && j === (W - 1) / 2) line += " ";
					else line += map[i][j] > 0 ? `${map[i][j]}` : ".";
				}
			}
			console.error(line);
		}
	}

	// TopLeft, TopRight, BottomLeft, BottomRight
	const quadrants = [0, 0, 0, 0];
	const results: [number, number][] = [];
	for (const line of data) {
		const x = mod(line.p[0] + line.v[0] * TIME, W);
		const y = mod(line.p[1] + line.v[1] * TIME, H);

		if (x < (W - 1) / 2 && y < (H - 1) / 2) quadrants[0]++;
		if (x > (W - 1) / 2 && y < (H - 1) / 2) quadrants[1]++;
		if (x < (W - 1) / 2 && y > (H - 1) / 2) quadrants[2]++;
		if (x > (W - 1) / 2 && y > (H - 1) / 2) quadrants[3]++;

		results.push([x, y]);
	}
	display(results, false);
	console.error(quadrants);

	return quadrants.reduce((a, b) => a * b, 1);
}

function spread(data: [number, number][], W: number, H: number): number {
	let total = 0;

	for (const [x1, y1] of data) {
		for (const [x2, y2] of data) {
			total += Math.abs(x1 - x2) + Math.abs(y1 - y2);
		}
	}

	return total;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data.split("\n").map((line) => {
		const matches = line.match(/p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/)!;
		return {
			p: [Number(matches[1]), Number(matches[2])],
			v: [Number(matches[3]), Number(matches[4])],
		};
	});

	const [W, H] = [101, 103];

	function display(data: [number, number][], drawMiddles = false) {
		const map = [...Array(H)].map(() => Array(W).fill(0));

		for (const [x, y] of data) map[y][x]++;

		for (let i = 0; i < H; i++) {
			let line = "";
			if (!drawMiddles && i === (H - 1) / 2) {
				line += "\n";
			} else {
				for (let j = 0; j < W; j++) {
					if (!drawMiddles && j === (W - 1) / 2) line += " ";
					else line += map[i][j] > 0 ? `${map[i][j]}` : ".";
				}
			}
			console.error(line);
		}
	}
	function writeDisplay(data: [number, number][], filename: string) {
		const map = [...Array(H)].map(() => Array(W).fill(0));

		for (const [x, y] of data) map[y][x]++;

		const png = new PNGlib(W, H, 256);
		png.setBgColor([255, 255, 255]);
		for (let i = 0; i < H; i++) {
			for (let j = 0; j < W; j++) {
				const v = map[i][j] > 0 ? 0 : 255;
				png.setPixel(j, i, [v, v, v]);
			}
		}

		Deno.writeFileSync(filename, png.getBuffer());
	}

	// TopLeft, TopRight, BottomLeft, BottomRight
	let minSpread = Infinity;
	let minResults: [number, number][] = [];
	let minT = 0;
	for (let t = 0; t < 10000; t++) {
		console.error(t);
		const results: [number, number][] = [];
		for (const line of data) {
			const x = mod(line.p[0] + line.v[0] * t, W);
			const y = mod(line.p[1] + line.v[1] * t, H);

			results.push([x, y]);
		}
		const s = spread(results, W, H);
		if (s < minSpread) {
			minSpread = s;
			minResults = results;
			minT = t;
		}
		// display(results, true);

		// I was using this to generate the images. I the ran through them manually
		// (in finder) to find the one that looked best.
		// writeDisplay(results, `day142/${t}.png`);
	}
	display(minResults, true);

	return minT;
}

runner(solvePt1, solvePt2);
