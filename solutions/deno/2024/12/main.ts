#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";

type Position = [number, number];
function serializePos(pos: Position): string {
	return `${pos[0]},${pos[1]}`;
}

function fillArea(
	screen: string[][],
	start: Position,
	otherRegionsPositions: Position[],
): [Position[], Position[]] {
	const stack: Position[] = [];

	// For knowing whether to add to stack (do not visit previously visited nodes).
	const visited = new Set<string>();

	// For knowing whether to add to outside (I do not want repeats on the outside
	// list after this function's invocation. I want to be able to just concatenate
	// it).
	const prevVisited = new Set<string>();
	for (const pos of otherRegionsPositions) {
		prevVisited.add(serializePos(pos));
	}

	// inside is the same as visited, but in array form
	const inside: Position[] = [];
	const outside: Position[] = [];

	stack.push(start);
	const [sx, sy] = start;
	const plantType: string | null = screen[sy][sx];

	while (stack.length > 0) {
		const pos = stack.pop();
		if (pos == null) throw Error("stack.length > 0, but no item in stack");
		const [x, y] = pos;

		if (visited.has(serializePos(pos))) continue;

		// console.error(`  Exploring ${pos}`);
		// console.error(`   Visited: ${Array.from(visited.values()).join("; ")}`);
		// console.error(`   stack: ${stack.map(serializePos).join("; ")}`);
		// console.error(`   inside: ${inside}`);
		// console.error(`   outside: ${outside}`);

		visited.add(serializePos(pos));

		// if the node is inside (has the same plant type)
		if (plantType === screen[y][x]) {
			// Add nodes to the north, west, east, south to the stack (only if not
			// previously visited).

			if (y - 1 >= 0 && !visited.has(serializePos([x, y - 1])))
				// North
				stack.push([x, y - 1]);
			if (y + 1 < screen.length && !visited.has(serializePos([x, y + 1])))
				// South
				stack.push([x, y + 1]);
			if (x - 1 >= 0 && !visited.has(serializePos([x - 1, y])))
				// West
				stack.push([x - 1, y]);
			if (x + 1 < screen.length && !visited.has(serializePos([x + 1, y])))
				// East
				stack.push([x + 1, y]);

			inside.push(pos);
		} else {
			if (!prevVisited.has(serializePos(pos))) outside.push(pos);
		}
	}

	return [inside, outside];
}

function findRegions(data: string[][]): Position[][] {
	const regions: Position[][] = [];
	const notVisitedMap: Record<string, Position> = {};

	const addnv = (pos: Position) => {
		const key = serializePos(pos);
		if (notVisitedMap[key] != null) return;
		notVisitedMap[key] = pos;
	};
	const removenv = (pos: Position) => {
		const key = serializePos(pos);
		if (notVisitedMap[key] == null) return;
		delete notVisitedMap[key];
	};
	// pop 0
	const popnv = (): Position | null => {
		const keys = Object.keys(notVisitedMap);
		if (keys.length === 0) return null;
		const key = keys[0];
		const pos = notVisitedMap[key];
		delete notVisitedMap[key];
		return pos;
	};
	const lennv = (): number => Object.keys(notVisitedMap).length;
	const hasnv = (pos: Position) => notVisitedMap[serializePos(pos)] != null;

	addnv([0, 0]);

	// let i = 0;
	while (lennv() > 0) {
		// console.error(`${i++}`);
		const pos = popnv();
		if (pos == null) throw Error("notVisited.length > 0, but no item in stack");

		// Call fillArea to find the area of the region.
		// console.error(`Exploring region at ${pos}`);

		const [inside, outside] = fillArea(data, pos, regions.flat());
		regions.push(inside);

		for (const pos of outside) {
			addnv(pos);
		}
		for (const pos of inside) {
			removenv(pos);
		}
		// console.error(
		// 	`Region at ${pos} has ${inside.length} inside and ${outside.length} outside`,
		// );
		// console.error("Inside: ", inside);
		// console.error("Outside: ", outside);
		// console.error("Regions: ", regions);
		// console.error("Not visited: ", notVisited);
	}

	return regions;
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = input_data.split("\n").map((x) => x.split(""));

	const regions = findRegions(data);
	console.error("Regions: ", regions);

	let sum = 0;
	for (const region of regions) {
		const set = new Set<string>();
		for (const pos of region) {
			set.add(serializePos([pos[0], pos[1]]));
		}

		// Calculate perimeter
		let perimeter = 0;
		for (const pos of region) {
			const [x, y] = pos;
			if (set.has(serializePos([x - 1, y])) === false) perimeter++;
			if (set.has(serializePos([x + 1, y])) === false) perimeter++;
			if (set.has(serializePos([x, y - 1])) === false) perimeter++;
			if (set.has(serializePos([x, y + 1])) === false) perimeter++;
		}

		// Calculate area
		const area = region.length;
		console.error(
			`Region: ${region}, a=${area}, p=${perimeter}, a*p=${area * perimeter}`,
		);

		sum += area * perimeter;
	}

	return sum;
}

function findSides(
	data: string[][],
	region: Position[],
	set: Set<string>,
): number {
	// Calculate sides, go in a clockwise direction, and count the number of
	// turns.
	let sides = 0;

	// Start is upper left corner
	const start = region.reduce(
		(acc, [x, y]) => [Math.min(acc[0], x), Math.min(acc[1], y)],
		[Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
	);
	console.error("Start: ", start);

	let [x, y] = start;
	const startDir = [1, 0];
	let [dx, dy] = startDir;

	const printIfBounds = (mx: number, my: number): string => {
		if (my >= 0 && my < data.length && mx >= 0 && mx < data[my].length) {
			return data[my][mx];
		}
		return ".";
	};

	let i = 0;
	do {
		console.error(`Exploring ${x},${y} (${data[y][x]}) (${dx}, ${dy})`);

		const [nx, ny] = [x + dx, y + dy];
		console.error(`  next ${nx},${ny} (${printIfBounds(nx, ny)})`);
		const [lx, ly] = [x + dy, y - dx];
		console.error(`  left ${lx},${ly} (${printIfBounds(lx, ly)})`);

		if (!set.has(serializePos([nx, ny]))) {
			// If we have an empty space in front of us, we turn right.
			console.error(`    Turning right`);
			[dx, dy] = [dy, -dx];
			sides++;
		} else if (set.has(serializePos([lx, ly]))) {
			// We want to have an empty space to the left of our next position.
			// If we do not have an empty space to the left, we turn left.
			console.error(`    Turning left`);
			[dx, dy] = [-dy, dx];
			sides++;
		} else {
			[x, y] = [nx, ny];
		}

		console.error(
			`${x}-${start[0]}, ${y}-${start[1]}, ${dx}-${startDir[0]}, ${dy}-${startDir[1]}`,
		);

		if (i++ > 4) break;
	} while (
		!(
			x === start[0] &&
			y === start[1] &&
			dx === startDir[0] &&
			dy === startDir[1]
		)
	);

	return sides;
}

function findSides2(region: Position[], set: Set<string>): number {
	const [minX, minY] = region.reduce(
		(acc, [x, y]) => [Math.min(acc[0], x), Math.min(acc[1], y)],
		[Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
	);
	const [maxX, maxY] = region.reduce(
		(acc, [x, y]) => [Math.max(acc[0], x), Math.max(acc[1], y)],
		[Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
	);

	let sides = 0;
	function updateSides(acc: boolean, x: boolean): boolean {
		if (x === true && acc === false) {
			sides++;
		}
		return x;
	}

	for (let y = minY; y <= maxY; y++) {
		const upBorder = [];
		const downBorder = [];

		for (let x = minX; x <= maxX; x++) {
			if (set.has(serializePos([x, y]))) {
				upBorder.push(!set.has(serializePos([x, y - 1])));
				downBorder.push(!set.has(serializePos([x, y + 1])));
			} else {
				upBorder.push(false);
				downBorder.push(false);
			}
		}

		// Group and count groups.
		// console.error("sides0: ", sides);
		upBorder.reduce(updateSides, false);
		// console.error("sides1: ", sides, upBorder);
		downBorder.reduce(updateSides, false);
		// console.error("sides2: ", sides, downBorder);
	}

	for (let x = minX; x <= maxX; x++) {
		const leftBorder = [];
		const rightBorder = [];

		for (let y = minY; y <= maxY; y++) {
			if (set.has(serializePos([x, y]))) {
				leftBorder.push(!set.has(serializePos([x - 1, y])));
				rightBorder.push(!set.has(serializePos([x + 1, y])));
			} else {
				leftBorder.push(false);
				rightBorder.push(false);
			}
		}

		// Group and count groups.
		leftBorder.reduce(updateSides, false);
		rightBorder.reduce(updateSides, false);
	}

	return sides;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = input_data.split("\n").map((x) => x.split(""));

	const regions = findRegions(data);

	let sum = 0;
	// let i = 0;
	for (const region of regions) {
		// if (i++ > 0) continue;
		const set = new Set<string>();
		for (const pos of region) {
			set.add(serializePos([pos[0], pos[1]]));
		}

		const sides = findSides2(region, set);
		// const sides = 0;

		// Calculate area
		const area = region.length;
		console.error(
			`Region: ${data[region[0][1]][region[0][0]]} | ${region}, a=${area}, s=${sides}, a*p=${area * sides}`,
		);

		sum += area * sides;
	}

	return sum;
}

runner(solvePt1, solvePt2);
