mod rust_runner;

use std::collections::{HashMap, HashSet};

use rust_runner::runner;

fn print_line(line: &str, beams: &HashSet<(usize, usize)>, row: usize) {
    for x in 0..line.len() {
        if beams.contains(&(row, x)) {
            eprint!("|");
        } else {
            eprint!("{}", &line.chars().nth(x).unwrap());
        }
    }
    eprintln!();
}

fn print_linehm(line: &str, beams: &HashMap<(usize, usize), i64>, row: usize) {
    for x in 0..line.len() {
        if beams.contains_key(&(row, x)) {
            eprint!("|");
        } else {
            eprint!("{}", &line.chars().nth(x).unwrap());
        }
    }
    eprintln!();
}

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let lines = input_data.lines().collect::<Vec<&str>>();
    let source_col = lines[0].chars().position(|c| c == 'S').unwrap();

    let mut sum = 0;
    let mut beams: HashSet<(usize, usize)> = HashSet::new();
    beams.insert((0, source_col));
    for i in 1..lines.len() {
        let splitters = lines[i]
            .chars()
            .enumerate()
            .filter(|(_, c)| *c == '^')
            .map(|(idx, _)| idx)
            .collect::<Vec<usize>>();
        let previous_row_beams = beams
            .iter()
            .filter(|(y, x)| *y == i - 1)
            .cloned()
            .collect::<Vec<(usize, usize)>>();
        // eprintln!("Processing row {}", i);
        // eprintln!("  splitters: {:?}", splitters);
        // eprintln!("  prev beams: {:?}", previous_row_beams);
        // eprintln!("  current beams before processing: {}", beams.len());

        for (by, bx) in &previous_row_beams {
            let mut hit_splitter = false;
            for spcol in &splitters {
                if *bx == *spcol {
                    eprintln!(
                        "    beam at ({},{}) hits splitter at ({},{})",
                        bx, by, i, spcol
                    );
                    let beamleft = (i, spcol - 1);
                    let beamright = (i, spcol + 1);
                    beams.insert(beamleft);
                    beams.insert(beamright);
                    sum += 1;
                    hit_splitter = true;
                    break;
                }
            }
            if !hit_splitter {
                beams.insert((i, *bx));
            }
        }
        print_line(lines[i], &beams, i);
    }
    sum
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let lines = input_data.lines().collect::<Vec<&str>>();
    let source_col = lines[0].chars().position(|c| c == 'S').unwrap();

    let mut beamcount: HashMap<(usize, usize), i64> = HashMap::new();
    beamcount.insert((0, source_col), 1);
    for i in 1..lines.len() {
        let splitters = lines[i]
            .chars()
            .enumerate()
            .filter(|(_, c)| *c == '^')
            .map(|(idx, _)| idx)
            .collect::<Vec<usize>>();
        let previous_row_beams = beamcount
            .iter()
            .filter(|((y, _), _)| *y == i - 1)
            .map(|(pos, _)| *pos)
            .collect::<Vec<(usize, usize)>>();
        // eprintln!("Processing row {}", i);
        // eprintln!("  splitters: {:?}", splitters);
        // eprintln!("  prev beams: {:?}", previous_row_beams);
        // eprintln!("  current beams before processing: {}", beams.len());

        for (by, bx) in &previous_row_beams {
            let mut hit_splitter = false;
            let count = *beamcount.get(&(*by, *bx)).unwrap();

            for spcol in &splitters {
                if *bx == *spcol {
                    eprintln!(
                        "    beam at ({},{}) hits splitter at ({},{})",
                        bx, by, i, spcol
                    );
                    let beamleft = (i, spcol - 1);
                    let beamright = (i, spcol + 1);
                    beamcount
                        .entry(beamleft)
                        .and_modify(|x| *x += count)
                        .or_insert(count);
                    beamcount
                        .entry(beamright)
                        .and_modify(|x| *x += count)
                        .or_insert(count);
                    hit_splitter = true;
                    break;
                }
            }
            if !hit_splitter {
                beamcount
                    .entry((i, *bx))
                    .and_modify(|x| *x += count)
                    .or_insert(count);
            }
        }
        print_linehm(lines[i], &beamcount, i);
    }
    eprintln!("Final beam counts: {:?}", beamcount);
    let sum = beamcount
        .iter()
        .filter(|((y, _), _)| *y == lines.len() - 1)
        .map(|(_, c)| *c)
        .sum();
    sum
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
