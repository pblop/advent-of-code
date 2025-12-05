mod rust_runner;

use rust_runner::runner;

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let lines: Vec<&str> = input_data.lines().collect();
    let mut sum = 0;
    for line in lines {
        let nums = line
            .chars()
            .map(|c| c.to_digit(10).unwrap() as i64)
            .collect::<Vec<i64>>();

        let mut largest_num = 0;
        for i in 0..nums.len() {
            for j in i + 1..nums.len() {
                let num = nums[i] * 10 + nums[j];
                if num > largest_num {
                    largest_num = num;
                }
            }
        }
        sum += largest_num;
    }
    sum as i64
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let lines: Vec<&str> = input_data.lines().collect();
    let mut sum = 0;
    for line in lines {
        let nums = line
            .chars()
            .map(|c| c.to_digit(10).unwrap() as u8)
            .collect::<Vec<u8>>();

        let target_len = 12;
        let to_remove = nums.len() - target_len;
        let mut result: Vec<u8> = Vec::new();
        let mut removed = 0;

        for &digit in &nums {
            while !result.is_empty() && removed < to_remove && *result.last().unwrap() < digit {
                result.pop();
                removed += 1;
            }
            result.push(digit);
        }
        result.truncate(target_len);
        let mut num = 0;
        for d in result {
            num = num * 10 + d as i64;
        }
        sum += num;
    }
    sum
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
