mod rust_runner;
use rust_runner::runner;

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let mut pos = 50;
    let mut numzero = 0;
    for line in input_data.lines() {
        let num = line[1..].parse::<i64>().unwrap();
        match line.chars().nth(0) {
            Some('L') => {
                pos -= num;
                pos = (pos + 100) % 100; // wrap around
                if pos == 0 {
                    numzero += 1;
                }
                eprintln!("L{}: pos={} numzero={}", num, pos, numzero);
            }
            Some('R') => {
                pos += num;
                pos = pos % 100; // wrap around
                if pos == 0 {
                    numzero += 1;
                }
                eprintln!("R{}: pos={} numzero={}", num, pos, numzero);
            }
            Some(c) => panic!("Invalid char {}", c),
            None => panic!("Empty line"),
        }
    }
    numzero
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let mut pos = 50;
    let mut numzero = 0;
    for line in input_data.lines() {
        let num = line[1..].parse::<i64>().unwrap();
        match line.chars().nth(0) {
            Some('L') => {
                let wasnt_zero = pos != 0;
                pos -= num;
                if pos <= 0 {
                    // each time we go below 0 (and we weren't at zero before), we count a zero crossing, plus every 100 below that
                    numzero += (-pos / 100) + wasnt_zero as i64;
                    if pos != 0 {
                        pos = pos.rem_euclid(100);
                    }
                }
                eprintln!("L{}: pos={} numzero={}", num, pos, numzero);
            }
            Some('R') => {
                pos += num;
                if pos >= 100 {
                    // each time we go above 99, we count a zero crossing, plus every 100 above that
                    numzero += pos / 100;
                    pos = pos % 100;
                }
                eprintln!("R{}: pos={} numzero={}", num, pos, numzero);
            }
            Some(c) => panic!("Invalid char {}", c),
            None => panic!("Empty line"),
        }
    }
    numzero
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
