mod rust_runner;

use std::{collections::HashMap, fmt::Debug};

use rust_runner::runner;

#[derive(Clone, Copy, PartialEq, Eq)]
struct Vec2 {
    x: i64,
    y: i64,
}
impl Vec2 {
    fn new(x: i64, y: i64) -> Self {
        Vec2 { x, y }
    }
    fn from_str(s: &str) -> Self {
        let coords: Vec<i64> = s
            .split(',')
            .map(|part| part.parse::<i64>().unwrap())
            .collect();
        Vec2::new(coords[0], coords[1])
    }
    fn cross(&self, other: &Vec2) -> i64 {
        self.x * other.y - self.y * other.x
    }
    fn cross2(&self, a: &Vec2, b: &Vec2) -> i64 {
        (*a - *self).cross(&(*b - *self))
    }
    fn dot(&self, other: &Vec2) -> i64 {
        self.x * other.x + self.y * other.y
    }
    fn sqr_len(&self) -> i64 {
        self.dot(self)
    }
}
impl std::ops::Add for Vec2 {
    type Output = Vec2;

    fn add(self, other: Vec2) -> Vec2 {
        Vec2::new(self.x + other.x, self.y + other.y)
    }
}
impl std::ops::Sub for Vec2 {
    type Output = Vec2;

    fn sub(self, other: Vec2) -> Vec2 {
        Vec2::new(self.x - other.x, self.y - other.y)
    }
}

impl Debug for Vec2 {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn solve_pt1(input_data: &str, args: &[String]) -> i64 {
    let tiles = input_data
        .lines()
        .map(|line| Vec2::from_str(line))
        .collect::<Vec<Vec2>>();
    let mut max_area = 0;
    for i in 0..tiles.len() {
        for j in (i + 1)..tiles.len() {
            let t1 = &tiles[i];
            let t2 = &tiles[j];

            let area = ((t1.x - t2.x).abs() + 1) * ((t1.y - t2.y).abs() + 1);
            if area > max_area {
                max_area = area;
            }
            eprintln!("Area between {:?} and {:?} = {}", t1, t2, area);
        }
    }
    max_area
}

fn is_valid_rect(t1: &Vec2, t2: &Vec2, polygon: &Vec<Vec2>) -> bool {
    let min_x = t1.x.min(t2.x);
    let max_x = t1.x.max(t2.x);
    let min_y = t1.y.min(t2.y);
    let max_y = t1.y.max(t2.y);

    // test if any of the polygon vertices are inside the rectangle
    // (taking a bite out of the rectangle)
    for v in polygon {
        if v.x > min_x && v.x < max_x && v.y > min_y && v.y < max_y {
            return false;
        }
    }

    // calculate the middle point of the rectangle for ray casting
    let mid_x = (min_x as f64 + max_x as f64) / 2.0;
    let mid_y = (min_y as f64 + max_y as f64) / 2.0;
    let mut inside_ray_count = 0;
    let n = polygon.len();

    for i in 0..n {
        let p1 = polygon[i];
        let p2 = polygon[(i + 1) % n]; // wrap around

        // check if vertical walls pass through rectangle (U shapes)
        if p1.x == p2.x && p1.x > min_x && p1.x < max_x {
            let wall_min_y = p1.y.min(p2.y);
            let wall_max_y = p1.y.max(p2.y);
            // check if the wall y is inside the rectangle y range
            if wall_min_y.max(min_y) < wall_max_y.min(max_y) {
                return false;
            }
        }
        // check if horizontal walls pass through rectangle (u shapes)
        if p1.y == p2.y && p1.y > min_y && p1.y < max_y {
            let wall_min_x = p1.x.min(p2.x);
            let wall_max_x = p1.x.max(p2.x);
            // check if the wall x is inside the rectangle x range
            if wall_min_x.max(min_x) < wall_max_x.min(max_x) {
                return false;
            }
        }

        // check if the rectangle's center (mid_x, mid_y) is inside the polygon
        // by counting how many times a ray to the right intersects polygon
        // edges. (doughnut shapes)
        // we're looking for edges that cross the horizontal line, that is
        // one point is above and one point is below the mid_y
        if (p1.y as f64 > mid_y) != (p2.y as f64 > mid_y) {
            // if the wall is to the right of mid_x, we hit it.
            if (p1.x as f64) > mid_x {
                inside_ray_count += 1;
            }
        }
    }

    // inside if odd number of intersections
    inside_ray_count % 2 == 1
}

fn solve_pt2(input_data: &str, args: &[String]) -> i64 {
    let mut polygon = input_data
        .lines()
        .map(|line| Vec2::from_str(line))
        .collect::<Vec<Vec2>>();

    let mut max_area = 0;
    for i in 0..polygon.len() {
        for j in (i + 1)..polygon.len() {
            let t1 = &polygon[i];
            let t2 = &polygon[j];

            // eprintln!("Checking between {:?} and {:?}", t1, t2);
            let area = ((t1.x - t2.x).abs() + 1) * ((t1.y - t2.y).abs() + 1);

            if area < max_area {
                continue;
            }
            if is_valid_rect(&t1, &t2, &polygon) {
                max_area = area;
            }
        }
    }
    max_area
}

fn main() {
    runner(solve_pt1, solve_pt2);
}
