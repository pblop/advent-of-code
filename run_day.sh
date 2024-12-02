#!/usr/bin/env bash

lang=$1
year=$2
day=$3

help() {
  echo "Usage: $0 <lang> <year> <day>"
  echo "  lang: The language to run the solution in"
  echo "  year: The year of the advent of code"
  echo "  day: The day of the advent of code"
}

check_args() {
  if [ -z "$lang" ]; then
    echo "Please provide a language"
    help
    exit 1
  fi

  if [ -z "$year" ]; then
    echo "Please provide a year"
    exit 1
    help
  fi

  if [ -z "$day" ]; then
    echo "Please provide a day"
    help
    exit 1
  fi
} 

check_args

echo "Running day $day/$year in $lang"

declare -A lang_file=(
  ["deno"]="main.ts"
  ["python"]="main.py"
)

cd "solutions/$lang/$year/$day"

if [ ! -f "${lang_file[$lang]}" ]; then
  echo "File ${lang_file[$lang]} does not exist"
  exit 1
fi

for input in input*.txt; do
  input_num="${input:5:1}"
  echo "Running $input for input $input_num"
  cat $input | ./"${lang_file[$lang]}" $input_num
done