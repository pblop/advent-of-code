mod rust_runner;

use rust_runner::runner;

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let lines = input_data.lines().collect::<Vec<&str>>();
    let map = lines
        .iter()
        .map(|line| line.split_ascii_whitespace().collect::<Vec<&str>>())
        .collect::<Vec<Vec<&str>>>();
    let mut sum = 0;
    for col in 0..map[0].len() {
        let op = map.last().unwrap()[col];
        let mut col_op = if op == "*" { 1 } else { 0 };
        for row in 0..map.len() - 1 {
            let num = map[row][col].parse::<i64>().unwrap();
            match op {
                "+" => {
                    col_op += num;
                }
                "*" => {
                    col_op *= num;
                }
                _ => panic!("Unknown operation"),
            }
        }
        sum += col_op;
    }
    sum
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let lines = input_data.lines().collect::<Vec<&str>>();
    let operators = lines.last().unwrap();
    let mut op_locs = Vec::new();
    for (i, c) in operators.chars().enumerate() {
        if c == '+' || c == '*' {
            op_locs.push(i);
        }
    }
    eprintln!("Line len: {}", lines[0].len());
    let mut sum = 0;
    let mut map: Vec<i64> = Vec::new();
    for probi in 0..op_locs.len() {
        let colstart = op_locs[probi];
        let colend = if probi == op_locs.len() - 1 {
            lines[0].len()
        } else {
            op_locs[probi + 1] - 1
        };
        eprintln!("Processing prob {}: {}-{}", probi, colstart, colend);

        let mut nums: Vec<i64> = Vec::new();
        for col in colstart..colend {
            let mut numstr = String::new();
            for row in 0..lines.len() - 1 {
                let ch = lines[row].chars().nth(col).unwrap();
                if ch != ' ' {
                    numstr.push(ch);
                }
            }
            eprintln!("  num: {}", numstr);
            nums.push(numstr.parse::<i64>().unwrap());
        }

        let op = operators.chars().nth(colstart).unwrap();
        eprintln!("  op: {}", op);
        let col_op: i64 = match op {
            '+' => nums.iter().sum(),
            '*' => nums.iter().product(),
            _ => panic!("Unknown operation"),
        };
        eprintln!("  col_op: {}", col_op);
        sum += col_op;
    }
    sum
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
