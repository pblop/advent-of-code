mod rust_runner;

use std::{collections::HashSet, ops::RangeInclusive};

use rust_runner::runner;

fn str2range(s: &str) -> RangeInclusive<i64> {
    let parts: Vec<&str> = s.split('-').collect();
    let start: i64 = parts[0].parse().unwrap();
    let end: i64 = parts[1].parse().unwrap();
    start..=end
}

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let lines: Vec<&str> = input_data.lines().collect();
    let emptyline_idx = lines.iter().position(|&line| line.is_empty()).unwrap();
    let ranges = (&lines[..emptyline_idx])
        .iter()
        .map(|s| str2range(s))
        .collect::<Vec<_>>();

    let ingredients: Vec<i64> = (&lines[emptyline_idx + 1..])
        .iter()
        .map(|&s| s.parse::<i64>().unwrap())
        .collect();
    eprintln!("Ranges: {:?}", ranges);
    eprintln!("Ingredients: {:?}", ingredients);

    let mut fresh = 0;
    for ing in ingredients {
        for range in &ranges {
            if range.contains(&ing) {
                fresh += 1;
                break;
            }
        }
    }
    fresh
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let lines: Vec<&str> = input_data.lines().collect();
    let emptyline_idx = lines.iter().position(|&line| line.is_empty()).unwrap();
    let mut ranges = (&lines[..emptyline_idx])
        .iter()
        .map(|s| str2range(s))
        .collect::<Vec<_>>();

    ranges.sort_by_key(|r| *r.start());
    eprintln!("Ranges: {:?}", ranges);
    let mut merged_ranges: Vec<RangeInclusive<i64>> = Vec::new();
    let mut fresh = 0;
    for range in ranges {
        eprintln!("Processing Range: {:?}", range);
        if let Some(last) = merged_ranges.last_mut() {
            eprintln!("  last merged range: {:?}", last);
            if range.start() <= last.end() {
                eprintln!("  merging with last range");
                if range.end() > last.end() {
                    eprintln!(
                        "  extending last range end from {:?} to {:?}",
                        last.end(),
                        range.end()
                    );
                    *last = *last.start()..=*range.end();
                }
            } else {
                eprintln!("  adding new range: {:?}", range);
                merged_ranges.push(range);
            }
        } else {
            eprintln!("  adding first range: {:?}", range);
            merged_ranges.push(range);
        }
    }

    eprintln!("Merged Ranges: {:?}", merged_ranges);
    for range in merged_ranges {
        fresh += range.end() - range.start() + 1;
    }

    fresh as i64
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
