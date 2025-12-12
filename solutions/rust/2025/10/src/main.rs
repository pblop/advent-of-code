mod rust_runner;

use good_lp::{
    Expression, ProblemVariables, Solution, SolverModel, constraint,
    solvers::{self},
    variable,
};
use rust_runner::runner;
use std::collections::HashMap;

struct LineProblem {
    end_state: Vec<i32>,
    transitions: Vec<Vec<i32>>,
    part2_end_state: Vec<i64>,
}

fn parse_input(line: &str) -> LineProblem {
    let end_state = line
        .chars()
        .filter(|c| *c == '.' || *c == '#')
        .map(|c| if c == '.' { 0 } else { 1 })
        .collect::<Vec<_>>();
    let transitions = line
        .split_terminator(|c| c == '(' || c == ')')
        .enumerate()
        .filter(|(i, _)| i % 2 == 1)
        .map(|(_, s)| {
            s.split(',')
                .filter_map(|num_str| num_str.trim().parse::<i32>().ok())
                .collect::<Vec<_>>()
        })
        .collect::<Vec<_>>();
    let part2_end_state = line
        .split_terminator(|c| c == '{' || c == '}')
        .nth(1)
        .map(|s| {
            s.split(',')
                .filter_map(|num_str| num_str.trim().parse::<i64>().ok())
                .collect::<Vec<_>>()
        })
        .unwrap();

    LineProblem {
        end_state,
        transitions,
        part2_end_state,
    }
}

fn heuristic1(state: &Vec<i32>, end_state: &Vec<i32>) -> i32 {
    return 0;
}

fn apply_transition1(state: &Vec<i32>, transition: &Vec<i32>) -> Vec<i32> {
    let mut new_state = state.clone();
    for i in transition {
        new_state[*i as usize] ^= 1;
    }
    new_state
}

fn a_star_search1(
    start_state: Vec<i32>,
    end_state: Vec<i32>,
    transitions: Vec<Vec<i32>>,
) -> Option<Vec<Vec<i32>>> {
    let mut open_set = vec![start_state.clone()];
    let mut came_from: HashMap<_, Vec<i32>> = HashMap::new();
    let mut g_score = HashMap::new();
    g_score.insert(start_state.clone(), 0);
    let mut f_score = HashMap::new();
    f_score.insert(start_state.clone(), heuristic1(&start_state, &end_state));
    while !open_set.is_empty() {
        open_set.sort_by_key(|state| f_score.get(state).cloned().unwrap_or(i32::MAX));
        let current = open_set.remove(0);
        if current == end_state {
            let mut path = Vec::new();
            let mut temp = current.clone();
            path.push(temp.clone());
            while let Some(prev) = came_from.get(&temp) {
                temp = prev.clone();
                path.push(temp.clone());
            }
            path.reverse();
            return Some(path);
        }
        for transition in &transitions {
            let neighbor = apply_transition1(&current, transition);
            let tentative_g_score = g_score.get(&current).cloned().unwrap_or(i32::MAX) + 1;
            if tentative_g_score < *g_score.get(&neighbor).unwrap_or(&i32::MAX) {
                came_from.insert(neighbor.clone(), current.clone());
                g_score.insert(neighbor.clone(), tentative_g_score);
                f_score.insert(
                    neighbor.clone(),
                    tentative_g_score + heuristic1(&neighbor, &end_state),
                );
                if !open_set.contains(&neighbor) {
                    open_set.push(neighbor);
                }
            }
        }
    }
    return None;
}

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let problems = input_data
        .lines()
        .map(|line| parse_input(line))
        .collect::<Vec<_>>();
    let mut sum = 0;
    for problem in problems {
        eprintln!("End State: {:?}", problem.end_state);
        eprintln!("Transitions: {:?}", problem.transitions);
        let start_state = vec![0; problem.end_state.len()];
        let result = a_star_search1(start_state, problem.end_state, problem.transitions);
        if let Some(path) = result {
            sum += (path.len() - 1) as i64;
        } else {
            panic!("No path found");
        }
    }
    sum
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let problems = input_data
        .lines()
        .map(|line| parse_input(line))
        .collect::<Vec<_>>();
    let mut sum = 0;
    for problem in problems {
        eprintln!("End State: {:?}", problem.part2_end_state);
        eprintln!("Transitions: {:?}", problem.transitions);
        let mut end_state = problem.part2_end_state.clone();

        let mut vars = ProblemVariables::new();
        let mut vars_vec = Vec::new();
        for transition in &problem.transitions {
            let max_applications = transition
                .iter()
                .map(|&idx| end_state[idx as usize])
                .min()
                .unwrap_or(0);
            eprintln!(
                "Max applications for transition {:?}: {}",
                transition, max_applications
            );

            let var = vars.add(variable().min(0).max(max_applications as f64).integer());
            vars_vec.push(var);
        }

        let objective: Expression = vars_vec.iter().sum();
        let solver = solvers::coin_cbc::coin_cbc;
        let mut model = vars.minimise(objective.clone()).using(solver);

        for (idx, &target_val) in end_state.iter().enumerate() {
            let mut expr = Expression::from(0);

            for (t_idx, transition) in problem.transitions.iter().enumerate() {
                if transition.contains(&(idx as i32)) {
                    expr += vars_vec[t_idx];
                }
            }

            model.add_constraint(constraint!(expr == target_val as f64));
        }
        let solution = model.solve().unwrap();
        let result = solution.eval(objective);
        eprintln!("Optimal steps found: {}", result);
        sum += result as i64;
    }
    sum
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
