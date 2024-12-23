export function read2DGrid(input_data: string): string[][] {
	return input_data.split("\n").map((line) => line.split(""));
}

export type Position = [number, number];
