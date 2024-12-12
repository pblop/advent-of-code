type SolveFunction = (input_data: string, args?: string[]) => number | bigint;

async function readFromStdin() {
	let input_data = "";
	const decoder = new TextDecoder();
	for await (const chunk of Deno.stdin.readable) {
		const text = decoder.decode(chunk);
		input_data += text;
	}
	return input_data;
}

export async function runner(part1Fn: SolveFunction, part2Fn: SolveFunction) {
	const partn = Deno.args[0];
	const input_data = (await readFromStdin()).trim();

	const fn = partn === "1" ? part1Fn : part2Fn;
	const result = fn(input_data, Deno.args.slice(1));
	if (typeof result === "bigint") {
		console.log(result.toString().replace(/n$/, ""));
	} else {
		console.log(result);
	}

	Deno.exit(0);
}
