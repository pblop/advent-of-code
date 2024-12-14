#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

type Machine = {
	A: { x: number; y: number };
	B: { x: number; y: number };
	prize: { x: number; y: number };
};

function solvePt1(input_data: string, args?: string[]): number {
	const data: Machine[] = input_data.split("\n\n").map((group) => {
		const lines = group.split("\n");
		const A = lines[0]
			.match(/Button .: X\+(\d+), Y\+(\d+)/)!
			.slice(1)
			.map(Number);
		const B = lines[1]
			.match(/Button .: X\+(\d+), Y\+(\d+)/)!
			.slice(1)
			.map(Number);
		const prize = lines[2]
			.match(/Prize: X=(\d+), Y=(\d+)/)!
			.slice(1)
			.map(Number);
		return {
			A: { x: A[0], y: A[1] },
			B: { x: B[0], y: B[1] },
			prize: { x: prize[0], y: prize[1] },
		};
	});

	let total = 0;
	for (const machine of data) {
		console.error(machine);

		const adbc = machine.A.x * machine.B.y - machine.B.x * machine.A.y;

		const A =
			(machine.B.y * machine.prize.x - machine.B.x * machine.prize.y) / adbc;
		const B =
			(-machine.A.y * machine.prize.x + machine.A.x * machine.prize.y) / adbc;
		const result = 3 * A + B;
		console.error(`A: ${A}, B: ${B}, result: ${result}`);

		if (!Number.isInteger(A) || !Number.isInteger(B)) continue;

		// console.error(A, B);
		total += result;
	}

	return total;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data: Machine[] = input_data.split("\n\n").map((group) => {
		const lines = group.split("\n");
		const A = lines[0]
			.match(/Button .: X\+(\d+), Y\+(\d+)/)!
			.slice(1)
			.map(Number);
		const B = lines[1]
			.match(/Button .: X\+(\d+), Y\+(\d+)/)!
			.slice(1)
			.map(Number);
		const prize = lines[2]
			.match(/Prize: X=(\d+), Y=(\d+)/)!
			.slice(1)
			.map((x) => Number(x) + 10000000000000);
		return {
			A: { x: A[0], y: A[1] },
			B: { x: B[0], y: B[1] },
			prize: { x: prize[0], y: prize[1] },
		};
	});

	let total = 0;
	for (const machine of data) {
		console.error(machine);

		const adbc = machine.A.x * machine.B.y - machine.B.x * machine.A.y;

		const A =
			(machine.B.y * machine.prize.x - machine.B.x * machine.prize.y) / adbc;
		const B =
			(-machine.A.y * machine.prize.x + machine.A.x * machine.prize.y) / adbc;
		const result = 3 * A + B;
		console.error(`A: ${A}, B: ${B}, result: ${result}`);

		if (!Number.isInteger(A) || !Number.isInteger(B)) continue;

		// console.error(A, B);
		total += result;
	}

	// return total;
	return total;
}

runner(solvePt1, solvePt2);
