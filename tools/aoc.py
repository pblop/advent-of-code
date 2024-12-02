#!/usr/bin/env uv run
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "typer",
#     "requests",
#     "rich",
#     "beautifulsoup4"
# ]
# ///

import sys
import tomllib
from pathlib import Path
import os
import shutil
import subprocess
import re

import typer
import requests
from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich.prompt import Confirm
from bs4 import BeautifulSoup
from typing_extensions import Annotated

app = typer.Typer()
console = Console()

def get_cookie():
  # Set the session cookie in the request headers
  cookie = os.environ.get("AOC_SESSION_COOKIE")
  if not cookie:
    # Try to read the cookie from a file
    try:
      with open(".env", "r", encoding="utf-8") as cookie_file:
        lines = cookie_file.read().splitlines()
        # Find the line with the cookie
        for line in lines:
          if line.startswith("AOC_SESSION_COOKIE="):
            cookie = line.split("=")[1]
            break
        else:
          print("Error: AOC_SESSION_COOKIE environment variable not set, and .env file "
                "does not contain the cookie")
          sys.exit(1)
    except FileNotFoundError:
      print("Error: AOC_SESSION_COOKIE environment variable not set, and .env file not found")
      sys.exit(1)

  return cookie

@app.command()
def fetch(year: int, day: int,
          force: Annotated[bool, typer.Option(help="Forces the redownload/recreation of the files")] = False):
  # Make folder structure
  folder = Path(f"./problems/{year}/{day:02}")
  folder.mkdir(parents=True, exist_ok=True)
  input_file = folder / "input.txt"
  tests_file = folder / "tests.toml"

  if force or not input_file.exists():
    input_url = f"https://adventofcode.com/{year}/day/{day}/input"
    headers = {"Cookie": f"session={get_cookie()}"}
    print("Dowloading puzzle input...", end='', flush=True)
    response = requests.get(input_url, headers=headers, timeout=120)
    print("done", flush=True)
    if response.status_code == 404:
      print("Error: The puzzle input is not yet available")
      sys.exit(1)
    elif response.status_code != 200:
      print(f"\nError: {response.status_code}")
      sys.exit(1)

    print("Writing puzzle input...", end='', flush=True)
    with open(input_file, "w", encoding="utf-8") as f:
      f.write(response.text)
  else:
    print("Input file already exists, skipping")

  if force or not tests_file.exists():
    with open(tests_file, "w", encoding="utf-8") as f:
      f.write("""[test_01]
  part = 1
  input = \"\"\"\"\"\"
  expected = 0

  [test_02]
  part = 2
  input = \"\"\"\"\"\"
  expected = 0 """)
    print("done", flush=True)
  else:
    print("Tests file already exists, skipping")

@app.command()
def start(lang: str, year: int, day: int):
  # Download puzzle input if it doesn't exist
  input_file = Path(f"./problems/{year}/{day}/input.txt")
  if not input_file.exists():
    fetch(year, day)
  
  solutions_folder = Path(f"./solutions/{lang}/{year}/{day}")
  if solutions_folder.exists():
    print("Error: Solutions folder already exists")
    sys.exit(1)

  template_folder = Path(f"./templates/{lang}")
  if not template_folder.exists():
    print(f"Error: Template folder for language '{lang}' not found")
    sys.exit(1)
  
  # Copy template files to solutions folder
  shutil.copytree(template_folder, solutions_folder)

def run_day(lang: str, year: int, day: int, part: int, input_text: str) -> [int, str]:
  solution_folder = Path(f"./solutions/{lang}/{year}/{day:02}")
  if not solution_folder.exists():
    print(f"Error: Solution folder ({solution_folder}) not found")
    sys.exit(1)

  if lang == "deno":
    command = "main.ts"
  else:
    print(f"Error: Language '{lang}' not supported")
    sys.exit(1)

  p = subprocess.run([solution_folder / command, str(part)],
        input=input_text, capture_output=True, text=True, check=True)

  stdout = p.stdout.strip()
  stderr = p.stderr.strip()

  return int(stdout), stderr

def do_test(lang: str, year: int, day: int, test_name: str, test: dict):
  part, input_text= test["part"], test["input"]
  expected = test.get("expected", None)

  table = Table(show_header=False, show_edge=False, box=None, min_width=50, pad_edge=False)
  table.add_column("col1", justify="left")
  table.add_column("col2", justify="right")

  test_info = f"Test [bold cyan]{test_name}[/bold cyan] (part [bold red]{part}[/bold red])..."

  result, debug_output = run_day(lang, year, day, part, input_text)

  if expected:
    status = ("passed", "bold green") if result == expected else ("failed", "bold red")
  else:
    status = ("done", "bold cyan")

  table.add_row(test_info, f"[{status[1]}]{status[0]}[/{status[1]}]")
  expected_str = f"  expected [bold green]{expected}[/bold green]" if expected else ""
  table.add_row(expected_str, f"got [{status[1]}]{result}[/{status[1]}]")

  if not expected or result != expected:
    if debug_output:
      table.add_row(f"  [{status[1]}]Debug output[/{status[1]}]")
      console.print(table)
      console.print(debug_output)
    else:
      table.add_row(f"  [{status[1]}]Debug output[/{status[1]}]", "[italic]no output[/italic]")
      console.print(table)
  else:
    console.print(table)

@app.command()
def test(lang: str, year: int, day: int,
         test: Annotated[str, typer.Option(help="The name of the test to run")] = "all"
         ):
  problems_folder = Path(f"./problems/{year}/{day:02d}")

  with open(problems_folder / "tests.toml", "r", encoding="utf-8") as f:
    tests = tomllib.loads(f.read())

  with console.status("Running tests...", spinner="dots"):
    if test == "all":
      for k, v in tests.items():
        do_test(lang, year, day, k, v)
    else:
      if test not in tests:
        console.print(f"Error: Test '{test}' not found", style="bold red")
      else:
        do_test(lang, year, day, test, tests[test])

def submit_result(year: int, day: int, part: int, result: int):
  url = f"https://adventofcode.com/{year}/day/{day}/answer"
  headers = {
    "Cookie": f"session={get_cookie()}"
  }
  data = {
    "level": part,
    "answer": result
  }
  response = requests.post(url, headers=headers, data=data, timeout=120)

  # Find the response message
  bs = BeautifulSoup(response.text, "html.parser")
  response_message = bs.find("main").find("article").text
  
  # [Return to Day \d+] replace with ""
  response_message = re.sub(r"\[Return to Day \d+\]", "", response_message)
  
  console.print(response_message)

@app.command()
def run(lang: str, year: int, day: int, part: int,
        submit: Annotated[bool, typer.Option(help="Whether to submit the result or not")] = False):
  problems_folder = Path(f"./problems/{year}/{day:02d}")
  input_file = problems_folder / "input.txt"

  with open(input_file, "r", encoding="utf-8") as f:
    input_text = f.read()

  result, debug_output = run_day(lang, year, day, part, input_text)

  table = Table(show_header=False, show_edge=False, box=None, min_width=50, pad_edge=False)
  table.add_column("col1", justify="left")
  table.add_column("col2", justify="right")

  with console.status("Running solution...", spinner="dots"):
    table.add_row(f"Solution for {day}/{year} (part {part})...", "[bold cyan]done[/bold cyan]")
    table.add_row("  [red]Debug output[/red]", "[italic]no output[/italic]" if not debug_output else "")
    console.print(table)
    if debug_output:
      console.print(debug_output)

    table = Table(show_header=False, show_edge=False, box=None, min_width=50, pad_edge=False)
    table.add_column("col1", justify="left")
    table.add_column("col2", justify="right")
    table.add_row("  [green bold]Result[/green bold]", f"[green bold]{result}[/green bold]")
    console.print(table)
  
  if submit:
    console.print("Submitting result...")
    submit_result(year, day, part, result)


if __name__ == "__main__":
  app()
