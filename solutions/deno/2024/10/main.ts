#!/usr/bin/env deno run

import { runner } from "../../../../lib/deno.ts";
import { posEq, type Position, read2DGrid } from "../../../../lib/deno2d.ts";

type Value = number | null;

function findAdjacent(data: Value[][], [x, y]: Position): Position[] {
	if (data[y][x] == null) return [];

	const [height, width] = [data.length, data[0].length];
	const adj: Position[] = [];

	const addIfValid = (_x: number, _y: number) => {
		if (
			_x < width &&
			_x >= 0 &&
			_y < height &&
			_y >= 0 &&
			data[_y][_x] != null &&
			(data[y][x] as number) + 1 === data[_y][_x]
		)
			adj.push([_x, _y]);
	};

	addIfValid(x + 1, y);
	addIfValid(x - 1, y);
	addIfValid(x, y - 1);
	addIfValid(x, y + 1);

	return adj;
}

function notReallyDijkstra(data: Value[][], start: Position): number {
	const open: Position[] = [start];
	const closed: Position[] = [];

	let nines = 0;
	while (open.length > 0) {
		const pos = open.pop()!;
		closed.push(pos);

		const [px, py] = pos;
		const val = data[py][px];
		if (val === 9) nines++;

		const adjacent = findAdjacent(data, pos);
		for (const nodePos of adjacent) {
			if (!open.find((x) => posEq(x, nodePos)) && !closed.find((x) => posEq(x, nodePos))) {
				open.push(nodePos);
			}
		}
	}

	return nines;
}

function solvePt1(input_data: string, args?: string[]): number {
	const data = read2DGrid<Value>(input_data, (value) => (value === "." ? null : Number(value)));

	const trailheads = data.flatMap((line, y) =>
		line.map((el, x) => (el === 0 ? [x, y] : null)).filter((pos) => pos != null),
	) as Position[];

	let sum = 0;
	for (const th of trailheads) {
		const nines = notReallyDijkstra(data, th);
		sum += nines;

		console.log(`${th}: ${nines}`);
	}
	// console.log(data);
	// console.log(trailheads);
	return sum;
}

type Node = {
	pos: Position;
	parents: Node[];
};
function newNode(pos: Position, parent?: Node) {
	if (parent != null) return { pos, parents: [parent] };

	return { pos, parents: [] };
}
function nodeEq(n1: Node, n2: Node): boolean {
	return posEq(n1.pos, n2.pos);
}
function dijkstra(data: Value[][], start: Position): number {
	// this is dijkstra
	const open: Node[] = [newNode(start)];
	const closed: Node[] = [];

	while (open.length > 0) {
		const node = open.pop()!;
		closed.push(node);

		const [x, y] = node.pos;
		const val = data[y][x];

		const adjacent = findAdjacent(data, node.pos);
		console.log(`${node.pos} (${val}). adj: ${adjacent}`);
		for (const adjPos of adjacent) {
			const adjNode = newNode(adjPos, node);

			const openNode = open.find((x) => nodeEq(x, adjNode));
			if (openNode != null) {
				openNode.parents.push(node);
				continue;
			}
			const closedNode = closed.find((x) => nodeEq(x, adjNode));
			if (closedNode != null) {
				closedNode.parents.push(node);
				continue;
			}

			open.push(adjNode);
		}
	}
	// dijkstra ends here

	const follow = (node: Node): number => {
		const [x, y] = node.pos;

		if (data[y][x] === 0) return 1;

		return node.parents.reduce((acc, parent) => acc + follow(parent), 0);
	};

	let rating = 0;
	// find all the nines and sum their ways to find a rating
	for (const node of closed) {
		const [x, y] = node.pos;
		const val = data[y][x];
		if (val === 9) rating += follow(node);
	}

	return rating;
}

function solvePt2(input_data: string, args?: string[]): number {
	const data = read2DGrid<Value>(input_data, (value) => (value === "." ? null : Number(value)));

	const trailheads = data.flatMap((line, y) =>
		line.map((el, x) => (el === 0 ? [x, y] : null)).filter((pos) => pos != null),
	) as Position[];

	let sum = 0;
	for (const th of trailheads) {
		const rating = dijkstra(data, th);
		sum += rating;

		console.log(`${th}: ${rating}`);
	}
	// console.log(data);
	// console.log(trailheads);
	return sum;
}

runner(solvePt1, solvePt2);
