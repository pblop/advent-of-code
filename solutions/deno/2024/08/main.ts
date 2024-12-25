#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";
import { read2DGrid, read2DGridString, type Position } from "../../../../lib/deno2d.ts";

type AntennaDict = Record<string, Position[]>;
type Antinodes = Position[];

function getAntennaDict(puzzle_input: string[][]): AntennaDict {
	const antennaDict: AntennaDict = {};

	for (let y = 0; y < puzzle_input.length; y++) {
		for (let x = 0; x < puzzle_input[y].length; x++) {
			const char = puzzle_input[y][x];
			if (char === ".") continue;

			antennaDict[char] ??= [];
			antennaDict[char].push([x, y]);
		}
	}

	return antennaDict;
}

// Attempt 1:
// // an antinode occurs at any point in line with two antennas, when one
// // of the antennas is twice as far away as the other.
// const [x1, y1] = positions[i];
// const [x2, y2] = positions[j];
// console.log(`P1: (${x1}, ${y1})`);
// console.log(`P2: (${x2}, ${y2})`);

// // We're ignoring the case where x1 == x2 for now
// // if (x1 === x2) continue;

// const d = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

// // midpoint (it's 3/2*d from any of the antinodes)
// const [xm, ym] = [(x1 + x2) / 2, (y1 + y2) / 2];
// const r = (3 / 2) * d;

// // y = mx + b (for the line between P1 and P2)
// const m = (y2 - y1) / (x2 - x1);
// const b = -m * x1 + y1;

// const qa = m + 1;
// const qb = -2 * xm + 2 * m * b - 2 * ym * m;
// const qc = b ** 2 + 2 * ym * b + xm ** 2 + ym ** 2 - r ** 2;

// const sq = Math.sqrt(qb ** 2 - 4 * qa * qc);

// const rx1 = (-qb + sq) / (2 * qa);
// const rx2 = (qb + sq) / (2 * qa);

// console.log(rx1, rx2);

function calculateAntinodes(antennaDict: AntennaDict, w: number, h: number): Antinodes {
	// A unique list of antinodes inside the grid
	const antinodes: Antinodes = [];
	const antinodesSet = new Set<string>();

	for (const [frequency, positions] of Object.entries(antennaDict)) {
		// Iterate all pairs of antennas
		for (let i = 0; i < positions.length; i++) {
			for (let j = i + 1; j < positions.length; j++) {
				// an antinode occurs at any point in line with two antennas, when one
				// of the antennas is twice as far away as the other.
				const [ax, ay] = positions[i];
				const [bx, by] = positions[j];
				// console.log(`A: (${ax}, ${ay})`);
				// console.log(`B: (${bx}, ${by})`);

				const [dx, dy] = [bx - ax, by - ay];
				// console.log(`d: (${dx}, ${dy})`);

				// A (A') is the reflection of A over the midpoint of A and B
				const [Ax, Ay] = [bx + dx, by + dy];
				// B (B') is the reflection of B over the midpoint of A and B
				const [Bx, By] = [ax - dx, ay - dy];

				// console.log(`A': (${Ax}, ${Ay})`);
				// console.log(`B': (${Bx}, ${By})`);
				const Astr = `${Ax},${Ay}`;
				const Bstr = `${Bx},${By}`;

				if (!antinodesSet.has(Astr) && Ax >= 0 && Ax < w && Ay >= 0 && Ay < h) {
					antinodes.push([Ax, Ay]);
					antinodesSet.add(Astr);
				}
				if (!antinodesSet.has(Bstr) && Bx >= 0 && Bx < w && By >= 0 && By < h) {
					antinodes.push([Bx, By]);
					antinodesSet.add(Bstr);
				}
			}
		}
	}

	return antinodes;
}

function solvePt1(input_data: string, args?: string[]): number {
	const puzzle_input = read2DGridString(input_data);

	const antennaDict = getAntennaDict(puzzle_input);
	const antinodes = calculateAntinodes(antennaDict, puzzle_input[0].length, puzzle_input.length);

	console.log("Antenna dict", antennaDict);
	console.log("Antinodes", antinodes);

	return antinodes.length;
}

function calculateAntinodes2_Bad(antennaDict: AntennaDict, w: number, h: number): Antinodes {
	// A unique list of antinodes inside the grid
	const antinodes: Antinodes = [];
	const antinodesSet = new Set<string>();

	for (const [frequency, positions] of Object.entries(antennaDict)) {
		// Iterate all pairs of antennas
		for (let i = 0; i < positions.length; i++) {
			for (let j = i + 1; j < positions.length; j++) {
				// an antinode occurs at any point in line with two antennas.

				const [ax, ay] = positions[i];
				const [bx, by] = positions[j];

				const m = (by - ay) / (bx - ax);
				const b = -m * ax + ay;

				for (let x = 0; x < w; x++) {
					const y = m * x + b;

					// Number.isInteger(y) skips some numbers (I get 902 as result, too low).
					// y - Math.floor(y) < 0.0001 gets too many numbers (I get 963 as a result, too high).
					if (y - Math.floor(y) < 0.00000000000001) {
						const str = `${x},${y}`;
						// (x is already >= 0 and < w)
						if (!antinodesSet.has(str) && y >= 0 && y < h) {
							antinodes.push([x, y]);
							antinodesSet.add(str);
						}
					}
				}
			}
		}
	}

	return antinodes;
}

function gcd(a: number, b: number): number {
	if (!b) return a;

	return gcd(b, a % b);
}

class Fraction {
	public numerator: number;
	public denominator: number;

	constructor(numerator: number, denominator: number, simplify = true) {
		if (simplify) {
			const divisor = gcd(numerator, denominator);
			this.numerator = numerator / divisor;
			this.denominator = denominator / divisor;
		} else {
			this.numerator = numerator;
			this.denominator = denominator;
		}
	}

	add(fraction: Fraction): Fraction {
		const numerator = this.numerator * fraction.denominator + fraction.numerator * this.denominator;
		const denominator = this.denominator * fraction.denominator;

		return new Fraction(numerator, denominator);
	}
	addInt(n: number): Fraction {
		return this.add(new Fraction(n, 1));
	}

	neg(): Fraction {
		return new Fraction(-this.numerator, this.denominator, false);
	}
	mul(fraction: Fraction): Fraction {
		return new Fraction(this.numerator * fraction.numerator, this.denominator * fraction.denominator);
	}
	mulInt(n: number): Fraction {
		return this.mul(new Fraction(n, 1));
	}

	isInteger(): boolean {
		return this.denominator === 1;
	}
	toNumber(): number {
		return this.numerator / this.denominator;
	}

	toString() {
		return `${this.numerator}/${this.denominator}`;
	}
}

function calculateAntinodes2(antennaDict: AntennaDict, w: number, h: number): Antinodes {
	// A unique list of antinodes inside the grid
	const antinodes: Antinodes = [];
	const antinodesSet = new Set<string>();

	for (const [frequency, positions] of Object.entries(antennaDict)) {
		// Iterate all pairs of antennas
		for (let i = 0; i < positions.length; i++) {
			for (let j = i + 1; j < positions.length; j++) {
				// an antinode occurs at any point in line with two antennas.

				const [ax, ay] = positions[i];
				const [bx, by] = positions[j];

				const m = new Fraction(by - ay, bx - ax);
				const b = m.neg().mulInt(ax).addInt(ay);
				console.log("m", m.toString());
				console.log("b", b.toString());

				for (let x = 0; x < w; x++) {
					const y = m.mulInt(x).add(b);

					// Number.isInteger(y) skips some numbers (I get 902 as result, too low).
					// y - Math.floor(y) < 0.0001 gets too many numbers (I get 963 as a result, too high).
					if (y.isInteger()) {
						const yint = y.toNumber();
						const str = `${x},${y}`;
						// (x is already >= 0 and < w)
						if (!antinodesSet.has(str) && yint >= 0 && yint < h) {
							antinodes.push([x, yint]);
							antinodesSet.add(str);
						}
					}
				}
			}
		}
	}

	return antinodes;
}

function solvePt2(input_data: string, args?: string[]): number {
	const puzzle_input = read2DGridString(input_data);

	const antennaDict = getAntennaDict(puzzle_input);
	const antinodes = calculateAntinodes2(antennaDict, puzzle_input[0].length, puzzle_input.length);

	console.log("Antenna dict", antennaDict);
	console.log("Antinodes", antinodes);
	return antinodes.length;
}

runner(solvePt1, solvePt2);
