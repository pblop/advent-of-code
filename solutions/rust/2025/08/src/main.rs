mod rust_runner;
use core::num;
use rust_runner::runner;
use std::{
    collections::{BTreeMap, HashMap},
    fmt::Debug,
};

struct JunctionBox {
    x: i64,
    y: i64,
    z: i64,
}
impl JunctionBox {
    fn new(x: i64, y: i64, z: i64) -> Self {
        JunctionBox { x, y, z }
    }
    fn from_str(s: &str) -> Self {
        let coords = s
            .split(",")
            .map(|c| c.parse::<i64>().unwrap())
            .collect::<Vec<i64>>();
        JunctionBox::new(coords[0], coords[1], coords[2])
    }
    fn dist_straight(&self, other: &JunctionBox) -> i64 {
        (self.x - other.x).pow(2) + (self.y - other.y).pow(2) + (self.z - other.z).pow(2)
    }
}
impl Debug for JunctionBox {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({}, {}, {})", self.x, self.y, self.z)
    }
}

fn top(circuit_sizes: &HashMap<i64, i64>, n: usize) -> Vec<i64> {
    let mut sizes = Vec::new();
    for size in circuit_sizes.values() {
        if sizes.len() < n {
            sizes.push(*size);
        } else {
            let mut lowest_index = 0;
            for i in 1..sizes.len() {
                if sizes[i] < sizes[lowest_index] {
                    lowest_index = i;
                }
            }
            if *size > sizes[lowest_index] {
                sizes[lowest_index] = *size;
            }
        }
    }
    sizes
}

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let junction_boxes = input_data
        .lines()
        .map(|s| JunctionBox::from_str(s))
        .collect::<Vec<JunctionBox>>();
    // the test input contains 20 junction boxes and creates 10 connections.
    // the real input creates 1000 connections.
    let connections = if junction_boxes.len() == 20 { 10 } else { 1000 };
    let mut distances: BTreeMap<i64, Vec<(i64, i64)>> = BTreeMap::new();
    for i in 0..junction_boxes.len() {
        for j in (i + 1)..junction_boxes.len() {
            let dist = junction_boxes[i].dist_straight(&junction_boxes[j]);
            distances
                .entry(dist)
                .or_default()
                .push((i as i64, j as i64));
        }
    }
    let mut used_connections = 0;
    let mut circuits_found = 0;
    let mut circuits: Vec<i64> = junction_boxes.iter().map(|_| -1).collect();
    let mut circuit_sizes: HashMap<i64, i64> = HashMap::new();

    for (dist, pairs) in distances.iter() {
        // eprintln!("Shortest distance is {} => {}", dist, pairs.len());
        for pair in pairs {
            // eprintln!(
            //     "  between {:?} and {:?}",
            //     junction_boxes[pair.0 as usize], junction_boxes[pair.1 as usize]
            // );
            let a = pair.0 as usize;
            let b = pair.1 as usize;
            let circa = circuits[a];
            let circb = circuits[b];

            if circa == -1 && circb == -1 {
                circuits[a] = circuits_found;
                circuits[b] = circuits_found;
                circuit_sizes.insert(circuits_found, 2);
                circuits_found += 1;
            } else if circa != -1 && circb == -1 {
                circuits[b] = circa;
                circuit_sizes.entry(circa).and_modify(|e| *e += 1);
            } else if circa == -1 && circb != -1 {
                circuits[a] = circb;
                circuit_sizes.entry(circb).and_modify(|e| *e += 1);
            } else if circa != circb {
                // merge circuits
                for i in 0..circuits.len() {
                    if circuits[i] == circb {
                        circuits[i] = circa;
                    }
                }
                let size_b = *circuit_sizes.get(&circb).unwrap();
                circuit_sizes.entry(circa).and_modify(|e| *e += size_b);
                circuit_sizes.remove(&circb);
            }

            used_connections += 1;
            if used_connections == connections {
                break;
            }
        }
        if used_connections == connections {
            break;
        }
    }
    eprintln!("Final circuits: {:?}", circuits);
    eprintln!("Circuit sizes: {:?}", circuit_sizes);
    let top_sizes = top(&circuit_sizes, 3);
    eprintln!("Top 3 sizes: {:?}", top_sizes);
    top_sizes.iter().product()
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let junction_boxes = input_data
        .lines()
        .map(|s| JunctionBox::from_str(s))
        .collect::<Vec<JunctionBox>>();
    let mut distances: BTreeMap<i64, Vec<(i64, i64)>> = BTreeMap::new();
    for i in 0..junction_boxes.len() {
        for j in (i + 1)..junction_boxes.len() {
            let dist = junction_boxes[i].dist_straight(&junction_boxes[j]);
            distances
                .entry(dist)
                .or_default()
                .push((i as i64, j as i64));
        }
    }
    let mut circuits_found = 0;
    let mut circuits: Vec<i64> = junction_boxes.iter().map(|_| -1).collect();
    let mut unconnected = junction_boxes.len();
    let mut circuit_sizes: HashMap<i64, i64> = HashMap::new();

    for (dist, pairs) in distances.iter() {
        // eprintln!("Shortest distance is {} => {}", dist, pairs.len());
        for pair in pairs {
            // eprintln!(
            //     "  between {:?} and {:?}",
            //     junction_boxes[pair.0 as usize], junction_boxes[pair.1 as usize]
            // );
            let a = pair.0 as usize;
            let b = pair.1 as usize;
            let circa = circuits[a];
            let circb = circuits[b];

            if circa == -1 && circb == -1 {
                circuits[a] = circuits_found;
                circuits[b] = circuits_found;
                circuit_sizes.insert(circuits_found, 2);
                unconnected -= 2;
                circuits_found += 1;
            } else if circa != -1 && circb == -1 {
                circuits[b] = circa;
                unconnected -= 1;
                circuit_sizes.entry(circa).and_modify(|e| *e += 1);
            } else if circa == -1 && circb != -1 {
                circuits[a] = circb;
                unconnected -= 1;
                circuit_sizes.entry(circb).and_modify(|e| *e += 1);
            } else if circa != circb {
                // merge circuits
                for i in 0..circuits.len() {
                    if circuits[i] == circb {
                        circuits[i] = circa;
                    }
                }
                let size_b = *circuit_sizes.get(&circb).unwrap();
                circuit_sizes.entry(circa).and_modify(|e| *e += size_b);
                circuit_sizes.remove(&circb);
            }

            if circuit_sizes.len() == 1 && unconnected == 0 {
                eprintln!(
                    "Last connection made between {:?} and {:?}",
                    junction_boxes[a], junction_boxes[b]
                );
                // we connected the last two boxes
                return junction_boxes[a].x * junction_boxes[b].x;
            }
        }
    }
    -1
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
