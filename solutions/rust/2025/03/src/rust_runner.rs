use std::env;
use std::io::{self, Read};

pub type SolveFunction = fn(&str, &[String]) -> i64;

pub fn runner(part1_fn: SolveFunction, part2_fn: SolveFunction) {
    let args: Vec<String> = env::args().collect();

    let part_n = args.get(1).expect("Part number (1 or 2) required");

    let mut input_data = String::new();
    io::stdin()
        .read_to_string(&mut input_data)
        .expect("Failed to read from stdin");
    let input_data = input_data.trim();

    let extra_args = if args.len() > 2 { &args[2..] } else { &[] };

    let result = if part_n == "1" {
        part1_fn(input_data, extra_args)
    } else {
        part2_fn(input_data, extra_args)
    };

    println!("{}", result);
}
