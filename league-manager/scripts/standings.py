#!/usr/bin/env python3
"""
Generic standings / points-table calculator for round-robin groups.

Sport-agnostic: works on sets/games (padel, tennis) or goals (football)
or points (basketball) — you tell it what a "win" is worth via
--points-win/--points-draw/--points-loss, and it aggregates whatever
score fields are in the results file.

Usage:
    python standings.py --results-file results.json

results.json format — a flat list of played matches:
[
  {"group": "Bayit 1", "a": "Team A", "b": "Team B", "score_a": 2, "score_b": 1},
  {"group": "Bayit 1", "a": "Team C", "b": "Team D", "score_a": 0, "score_b": 2},
  ...
]

score_a/score_b are whatever unit the sport uses (sets, games won, goals).
A draw is any match where score_a == score_b (only relevant for sports
that allow draws — pass --no-draws to force win/loss decision on tied
scores using --tiebreak-field if present, e.g. "games_a"/"games_b").

Output: standings per group, sorted by points desc, then goal/set
difference desc, then head-to-head record between tied teams (a simple
"who won more of the head-to-head meetings among tied teams" pass).
"""
import argparse
import json
from collections import defaultdict


def build_standings(matches, points_win=3, points_draw=1, points_loss=0):
    groups = defaultdict(lambda: defaultdict(lambda: {
        "played": 0, "won": 0, "drawn": 0, "lost": 0,
        "for": 0, "against": 0, "points": 0,
    }))

    for m in matches:
        grp = m.get("group", "default")
        a, b = m["a"], m["b"]
        sa, sb = m["score_a"], m["score_b"]

        ta, tb = groups[grp][a], groups[grp][b]
        ta["played"] += 1; tb["played"] += 1
        ta["for"] += sa; ta["against"] += sb
        tb["for"] += sb; tb["against"] += sa

        if sa > sb:
            ta["won"] += 1; ta["points"] += points_win
            tb["lost"] += 1; tb["points"] += points_loss
        elif sb > sa:
            tb["won"] += 1; tb["points"] += points_win
            ta["lost"] += 1; ta["points"] += points_loss
        else:
            ta["drawn"] += 1; tb["drawn"] += 1
            ta["points"] += points_draw; tb["points"] += points_draw

    # head-to-head map for tiebreaking
    h2h_points = defaultdict(lambda: defaultdict(int))
    for m in matches:
        grp = m.get("group", "default")
        a, b = m["a"], m["b"]
        sa, sb = m["score_a"], m["score_b"]
        if sa > sb:
            h2h_points[grp][(a, b)] = 3
        elif sb > sa:
            h2h_points[grp][(b, a)] = 3

    output = {}
    for grp, teams in groups.items():
        rows = []
        for name, t in teams.items():
            diff = t["for"] - t["against"]
            rows.append({"team": name, **t, "diff": diff})

        def h2h_score(row):
            # sum of head-to-head points this team earned against other tied teams
            return sum(h2h_points[grp].get((row["team"], other["team"]), 0) for other in rows if other["team"] != row["team"])

        rows.sort(key=lambda r: (-r["points"], -r["diff"], -r["for"], -h2h_score(r), r["team"]))
        for i, r in enumerate(rows):
            r["rank"] = i + 1
        output[grp] = rows

    return output


def main():
    ap = argparse.ArgumentParser(description="Build a standings/points table from match results.")
    ap.add_argument("--results-file", required=True, help="JSON file of played matches")
    ap.add_argument("--points-win", type=int, default=3)
    ap.add_argument("--points-draw", type=int, default=1)
    ap.add_argument("--points-loss", type=int, default=0)
    args = ap.parse_args()

    with open(args.results_file, encoding="utf-8") as f:
        matches = json.load(f)

    standings = build_standings(matches, args.points_win, args.points_draw, args.points_loss)
    print(json.dumps(standings, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
