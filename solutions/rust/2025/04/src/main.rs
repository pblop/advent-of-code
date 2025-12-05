mod rust_runner;

use rust_runner::runner;

fn count_adjacent(map: &Vec<Vec<char>>, x: usize, y: usize) -> i64 {
    let mut sum = 0;

    for dy in -1..=1 {
        for dx in -1..=1 {
            if dx == 0 && dy == 0 {
                continue;
            }
            let new_x = x as isize + dx;
            let new_y = y as isize + dy;
            if new_x >= 0
                && new_y >= 0
                && (new_y as usize) < map.len()
                && (new_x as usize) < map[new_y as usize].len()
            {
                if map[new_y as usize][new_x as usize] == '@' {
                    sum += 1;
                }
            }
        }
    }
    sum
}

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let map = input_data
        .lines()
        .map(|line| line.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let mut sum = 0;
    for y in 0..map.len() {
        for x in 0..map[y].len() {
            let char = map[y][x];
            if char == '.' {
                eprint!(".");
                continue;
            }
            let sum_adj = count_adjacent(&map, x, y);
            if sum_adj < 4 {
                eprint!("x");
                sum += 1;
            } else {
                eprint!("@");
            }
        }
        eprintln!();
    }

    sum
}

fn count_adjacent_fast(map: &Vec<Vec<char>>, x: usize, y: usize) -> i64 {
    let mut sum = 0;

    for dy in -1..=1 {
        for dx in -1..=1 {
            if dx == 0 && dy == 0 {
                continue;
            }
            let new_x = x as isize + dx;
            let new_y = y as isize + dy;
            if new_x >= 0
                && new_y >= 0
                && (new_y as usize) < map.len()
                && (new_x as usize) < map[new_y as usize].len()
            {
                if map[new_y as usize][new_x as usize] == '@' {
                    sum += 1;
                    // faster
                    if sum >= 4 {
                        return sum;
                    }
                }
            }
        }
    }
    sum
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let mut map = input_data
        .lines()
        .map(|line| line.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let mut rolls = map
        .iter()
        .map(|a| a.iter().filter(|&&c| c == '@').count() as i64)
        .sum::<i64>();
    eprintln!("Total rolls: {}", rolls);

    let mut sum = 0;
    loop {
        let rolls_before = rolls;
        let mut changes: Vec<(usize, usize)> = Vec::new();
        for y in 0..map.len() {
            for x in 0..map[y].len() {
                let char = map[y][x];
                if char == '.' {
                    eprint!(".");
                    continue;
                }

                let sum_adj = count_adjacent(&map, x, y);
                if sum_adj < 4 {
                    changes.push((x, y));
                    sum += 1;
                } else {
                    eprint!("@");
                }
            }
            eprintln!();
        }

        // eprintln!("Changes this iter: {}", changes.len());
        // update rolls
        rolls = rolls - (changes.len() as i64);

        // apply changes
        for (x, y) in changes {
            map[y][x] = '.'; // remove roll
        }

        // break if no changes
        if rolls == rolls_before {
            break;
        }
    }

    sum
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
