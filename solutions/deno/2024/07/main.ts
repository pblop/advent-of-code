#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function isValidOperation(operands: number[], result: number): boolean {
	// We have 2^(operands.length - 1) possible operations, and instead of
	// couting with 1s and 0s, we can + and * (the operands).

	for (let i = 0; i < 2 ** (operands.length - 1); i++) {
		let currentResult = operands[0];
		let str = `${operands[0]}`;

		for (let j = 1; j < operands.length; j++) {
			const operand = operands[j];

			let operation = "";
			if ((i >> (j - 1)) & 1) {
				operation = "*";
			} else {
				operation = "+";
			}

			// Count the result of the current operation
			if (operation === "+") {
				currentResult += operand;
			} else {
				currentResult *= operand;
			}
			str += ` ${operation} ${operand}`;
		}

		// console.error(`${str} = ${currentResult}, expected ${result}`);

		if (currentResult === result) {
			// console.error("Valid operation");
			return true;
		}
	}
	return false;
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data
		.trim()
		.split("\n")
		.map((line) => {
			const spl = line.split(": ");
			const result = Number(spl[0]);
			const operands = spl[1].split(" ").map(Number);
			return { result, operands };
		});

	let sumValid = 0;
	for (const { result, operands } of data) {
		// console.error(operands, result);
		if (isValidOperation(operands, result)) {
			sumValid += result;
		}
	}

	return sumValid;
}

function isValidOperation2(operands: number[], result: number): boolean {
	// We have 3^(operands.length - 1) possible operations.

	for (let i = 0; i < 3 ** (operands.length - 1); i++) {
		let currentResult = operands[0];
		let str = `${operands[0]}`;

		for (let j = 1; j < operands.length; j++) {
			const operand = operands[j];

			let operation = "";
			// convert to base 3 and get the j-th digit
			const k = Math.floor(i / 3 ** (j - 1)) % 3;
			if (k === 0) {
				operation = "*";
				currentResult *= operand;
			} else if (k === 1) {
				operation = "+";
				currentResult += operand;
			} else {
				operation = "||";
				currentResult = Number(`${currentResult}${operand}`);
			}

			str += ` ${operation} ${operand}`;
		}

		// console.error(`${str} = ${currentResult}, expected ${result}`);

		if (currentResult === result) {
			// console.error("Valid operation");
			return true;
		}
	}
	return false;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data
		.trim()
		.split("\n")
		.map((line) => {
			const spl = line.split(": ");
			const result = Number(spl[0]);
			const operands = spl[1].split(" ").map(Number);
			return { result, operands };
		});

	let sumValid = 0;
	// let i = 0;
	for (const { result, operands } of data) {
		// console.error(i++, data.length);
		if (isValidOperation2(operands, result)) {
			sumValid += result;
		}
	}

	return sumValid;
}

runner(solvePt1, solvePt2);
