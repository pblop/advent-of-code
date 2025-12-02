mod rust_runner;

use rust_runner::runner;

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let mut invalid_sum = 0;
    for group in input_data.split(",") {
        let nums: Vec<i64> = group
            .split("-")
            .map(|s| s.parse::<i64>().unwrap())
            .collect();
        let first: i64 = nums[0];
        let last = nums[1];
        eprintln!("Checking range: {}-{}", first, last);
        for i in first..=last {
            let s = i.to_string();
            let mut chars = s.chars().collect::<Vec<char>>();

            let first_char = chars[0];
            if first_char == '0' {
                invalid_sum += i;
                eprintln!("invalid due to leading zero: {}", i);
            } else {
                if chars.len() % 2 == 0 {
                    // splittable in two halves
                    let mid = chars.len() / 2;
                    let first_half = &chars[0..mid];
                    let second_half = &chars[mid..chars.len()];
                    if first_half == second_half {
                        eprintln!("invalid due to repeating halves: {}", i);
                        invalid_sum += i;
                    }
                }
            }
        }
    }
    invalid_sum
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let mut invalid_sum = 0;
    for group in input_data.split(",") {
        let nums: Vec<i64> = group
            .split("-")
            .map(|s| s.parse::<i64>().unwrap())
            .collect();
        let first: i64 = nums[0];
        let last = nums[1];
        eprintln!("Checking range: {}-{}", first, last);
        for i in first..=last {
            let s = i.to_string();
            let chars = s.chars().collect::<Vec<char>>();

            let first_char = chars[0];
            if first_char == '0' {
                invalid_sum += i;
                eprintln!("invalid due to leading zero: {}", i);
            } else {
                for j in 0..chars.len() / 2 {
                    let pattern = &chars[0..=j];
                    if check_pattern(&chars, pattern) {
                        eprintln!("invalid due to repeating pattern ({:?}): {}", pattern, i);
                        invalid_sum += i;
                        break;
                    }
                }
            }
        }
    }
    invalid_sum
}

fn check_pattern(chars: &Vec<char>, pattern: &[char]) -> bool {
    let pattern_len = pattern.len();
    if chars.len() % pattern_len != 0 {
        return false;
    }
    chars.chunks(pattern_len).all(|chunk| chunk == pattern)
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
