mod rust_runner;

use std::collections::{HashMap, HashSet};

use rust_runner::runner;

struct Graph {
    graph: Vec<Vec<bool>>,
    names: Vec<String>,
    names_map: HashMap<String, usize>,
}
impl Graph {
    fn new(input: &str) -> Self {
        // collect unique node names
        let mut name_set = HashSet::<String>::new();
        for line in input.lines() {
            for split in line.split(' ') {
                name_set.insert(split.replace(":", ""));
            }
        }

        // stable order of names
        let mut names: Vec<String> = name_set.into_iter().collect();
        names.sort();

        let size = names.len();
        let names_map = names
            .iter()
            .enumerate()
            .map(|(i, n)| (n.clone(), i))
            .collect();
        let graph = vec![vec![false; size]; size];

        Self {
            graph,
            names,
            names_map,
        }
    }
    fn get_index(&mut self, name: &str) -> usize {
        *self.names_map.get(name).unwrap()
    }
    fn add_edge(&mut self, from: usize, to: usize) {
        self.graph[from][to] = true;
    }
    fn count_paths(&mut self, from: usize, to: usize) -> i64 {
        if from == to {
            return 1;
        }
        let mut path_count = 0;
        let neighbors = self.graph[from].clone();
        for (i, &connected) in neighbors.iter().enumerate() {
            if connected {
                path_count += self.count_paths(i, to);
            }
        }
        path_count
    }
    fn count_paths_p2(
        &mut self,
        from: usize,
        to: usize,
        pass1: usize,
        pass2: usize,
        passed1: bool,
        passed2: bool,
        memo: &mut HashMap<(usize, bool, bool), i64>,
    ) -> i64 {
        if let Some(&cached) = memo.get(&(from, passed1, passed2)) {
            return cached;
        }
        if from == to {
            return if passed1 && passed2 { 1 } else { 0 };
        }
        let mut passed1 = passed1;
        let mut passed2 = passed2;
        if !passed1 && from == pass1 {
            passed1 = true;
        }
        if !passed2 && from == pass2 {
            passed2 = true;
        }
        let mut path_count = 0;
        let neighbors = self.graph[from].clone();
        for (i, &connected) in neighbors.iter().enumerate() {
            if connected {
                path_count += self.count_paths_p2(i, to, pass1, pass2, passed1, passed2, memo);
            }
        }
        memo.insert((from, passed1, passed2), path_count);
        path_count
    }
}

fn solve_pt1(input_data: &str, _args: &[String]) -> i64 {
    let mut part1 = Graph::new(input_data);
    for line in input_data.lines() {
        let (from, all_to) = line.split_once(": ").unwrap();
        let from_index = part1.get_index(from);
        for to in all_to.split(" ") {
            let to_index = part1.get_index(to);
            part1.add_edge(from_index, to_index);
        }
    }
    // for row in &part1.graph {
    //     eprintln!("{:?}", row);
    // }
    let you = part1.get_index("you");
    let out = part1.get_index("out");
    part1.count_paths(you, out)
}

fn solve_pt2(input_data: &str, _args: &[String]) -> i64 {
    let mut part2 = Graph::new(input_data);
    for line in input_data.lines() {
        let (from, all_to) = line.split_once(": ").unwrap();
        let from_index = part2.get_index(from);
        for to in all_to.split(" ") {
            let to_index = part2.get_index(to);
            part2.add_edge(from_index, to_index);
        }
    }

    let svr = part2.get_index("svr");
    let out = part2.get_index("out");
    let dac = part2.get_index("dac");
    let fft = part2.get_index("fft");
    part2.count_paths_p2(svr, out, dac, fft, false, false, &mut HashMap::new())
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
