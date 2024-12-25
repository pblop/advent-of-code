#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

function calcDir(move: string): [number, number] {
	switch (move) {
		case "^":
			return [0, -1];
		case "v":
			return [0, 1];
		case "<":
			return [-1, 0];
		case ">":
			return [1, 0];
		default:
			throw new Error(`Invalid move: ${move}`);
	}
}

function moveOnce(map: string[][], dir: [number, number], current: [number, number]): boolean {
	const [x, y] = current;
	const [dx, dy] = dir;

	// Check if the next position is a box/wall
	const [nx, ny] = [x + dx, y + dy];
	const next = map[ny][nx];
	if (next === "#") {
		// Wall
		return false;
	}

	if (next === "O") {
		// Box
		if (!moveOnce(map, dir, [nx, ny])) {
			// Box can't move
			return false;
		}

		// If the box can move, move the robot (the next position is now empty)
	}

	// Empty space
	const tmp = map[ny][nx];
	map[ny][nx] = map[y][x];
	map[y][x] = tmp;
	// console.error(`Moved ${map[ny][nx]} to ${nx},${ny}`);
	return true;
}

function calculateGPS(map: string[][]): number {
	let sum = 0;
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			if (map[y][x] === "O") {
				sum += x + y * 100;
			}
		}
	}
	return sum;
}

function dislayMap(map: string[][]): void {
	for (const line of map) {
		console.error(line.join(""));
	}
}

function solvePt1(input_data: string, args?: string[]): number {
	const split = input_data.split("\n\n");
	const map = split[0].split("\n").map((line) => line.split(""));
	const moves = split[1].replaceAll("\n", "").split("");

	const ry = map.findIndex((line) => line.includes("@"));
	const rx = map[ry].indexOf("@");
	const robot: [number, number] = [rx, ry];

	for (const move of moves) {
		const dir = calcDir(move);
		if (moveOnce(map, dir, robot)) {
			robot[0] += dir[0];
			robot[1] += dir[1];
		}

		// console.error(`Move ${move}, robot: ${robot}, dir: ${dir}`);
		// dislayMap(map);
	}

	return calculateGPS(map);
}

function canMove(map: string[][], dir: [number, number], current: [number, number], sidewaysCall = false): boolean {
	const [x, y] = current;
	const [dx, dy] = dir;

	const cur = map[y][x];

	// Check if the next position is a wall
	const [nx, ny] = [x + dx, y + dy];
	const next = map[ny][nx];
	if (next === "#") {
		// Wall
		return false;
	}

	// If we're moving up-down we need to check if both sides of a box can move
	// before continuing.
	// If, on the other hand, we're moving left-right, we can ignore this, because
	// both sides will be aligned.
	if (dy !== 0 && !sidewaysCall) {
		// In order to stop infinite recursion, we have the sidewaysCall parameter.
		// The first part of the box will check if the second part can move, and
		// the second part will ignore this code.
		if (cur === "[") {
			// Check if the right side of the box can move. If it cannot, we cannot.
			// If it can, we continue as normal.
			if (!canMove(map, dir, [x + 1, y], true)) return false;
		} else if (cur === "]") {
			// Do the same as the previous if, but for the left side of the box
			if (!canMove(map, dir, [x - 1, y], true))
				// Other side can't move, box can't move
				return false;
		}
	}

	// If we have a box in front, check if it can move. If it cannot, we cannot.
	// If it can, we can!
	// If we don't have a box in front (and we don't have a wall in front, because
	// of an if statement previously in this function), we can move.
	if (next === "[" || next === "]") {
		if (!canMove(map, dir, [nx, ny])) return false;
	}

	// If we're here, we can move.
	return true;
}

function recursiveMove(map: string[][], dir: [number, number], current: [number, number], sidewaysCall = false) {
	// console.log(`called recursiveMove(map, [${dir}], [${current}], ${sidewaysCall})`);
	const [x, y] = current;
	const [dx, dy] = dir;
	const cur = map[y][x];

	const [nx, ny] = [x + dx, y + dy];
	const next = map[ny][nx];

	// We stop when the the next position is a wall.
	if (next === "#") return;

	// If we have a box in front, we need to move it as well.
	if (next === "[" || next === "]") {
		recursiveMove(map, dir, [nx, ny]);
	}

	// THE ORDER OF THESE TWO IF STATEMENTS (the one above and the one below this
	// comment) IS ABSOLUTELY CRUCIAL. OTHERWISE TESTS custom01-03 WILL NOT PASS!

	// If we're moving up and we are part of a box, we need to move the other
	// part as well (only once per box, thus the sidewaysCall parameter).
	if (dy !== 0 && !sidewaysCall) {
		if (cur === "[") recursiveMove(map, dir, [x + 1, y], true);
		else if (cur === "]") recursiveMove(map, dir, [x - 1, y], true);
	}

	// Now that we have generated all the wanted recursions, we do the actual
	// moving (from the back to the front).
	const tmp = map[ny][nx];
	map[ny][nx] = map[y][x];
	map[y][x] = tmp;
	console.error(`Moved ${map[ny][nx]} from [${x},${y}] to [${nx},${ny}]`);
	// dislayMap(map);
}

function checkAndMove(map: string[][], dir: [number, number], current: [number, number]): boolean {
	if (!canMove(map, dir, current)) return false;

	recursiveMove(map, dir, current);
	return true;
}

function calculateGPS2(map: string[][]): number {
	let sum = 0;
	for (let y = 0; y < map.length; y++) {
		for (let x = 0; x < map[y].length; x++) {
			if (map[y][x] === "[") {
				sum += x + y * 100;
			}
		}
	}
	return sum;
}

function solvePt2(input_data: string, args?: string[]): number {
	const split = input_data.split("\n\n");
	const map = split[0].split("\n").map((line) =>
		line.split("").flatMap((c) => {
			if (c === "@") return ["@", "."];
			if (c === "#") return ["#", "#"];
			if (c === ".") return [".", "."];
			if (c === "O") return ["[", "]"];
			throw new Error(`Invalid character: ${c}`);
		}),
	);
	const moves = split[1].replaceAll("\n", "").split("");

	const ry = map.findIndex((line) => line.includes("@"));
	const rx = map[ry].indexOf("@");
	const robot: [number, number] = [rx, ry];

	// console.log("Initial: ");
	// dislayMap(map);

	// console.log("Now moving...");
	for (const move of moves) {
		const dir = calcDir(move);

		console.error(`Move ${move}, robot: ${robot}, dir: ${dir}`);
		// dislayMap(map);

		if (checkAndMove(map, dir, robot)) {
			robot[0] += dir[0];
			robot[1] += dir[1];
		}
	}

	// console.log("Final");
	dislayMap(map);

	return calculateGPS2(map);
}

runner(solvePt1, solvePt2);
