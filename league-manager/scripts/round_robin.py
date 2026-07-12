#!/usr/bin/env python3
"""
Generic round-robin fixture generator (circle/polygon method).

Works for ANY number of participants (teams, pairs, players) and any group
size — this is deliberately not hardcoded to 6 pairs / 5 weeks, because
group sizes change between seasons and between sports.

Usage:
    python round_robin.py --participants "A,B,C,D,E,F"
    python round_robin.py --participants-file participants.json --double
    python round_robin.py --count 8   # generates generic "Team 1".."Team 8"

Input (--participants-file) can be a JSON list of names, or a JSON list of
group objects: [{"group": "Bayit 1", "participants": ["A","B","C","D"]}, ...]
— in which case a schedule is generated per group.

Output: JSON to stdout.
{
  "participants": [...],
  "bye": true/false,
  "rounds": [
    {"round": 1, "matches": [["A","B"], ["C","D"]], "bye": null},
    ...
  ]
}

If --double is passed, a second leg is appended with home/away reversed
(standard "second round" of a double round-robin season).

Algorithm: standard circle method. Fix participant[0], rotate the rest.
If the number of participants is odd, a "BYE" placeholder is added so the
math works, and whoever is paired with BYE sits out that round.
"""
import argparse
import json
import sys


def generate_single_round_robin(participants):
    """Return list of rounds; each round is a list of [a, b] pairs.
    Handles odd counts via a BYE placeholder (removed from output, but
    recorded so callers know who sits out each round)."""
    people = list(participants)
    bye = False
    if len(people) % 2 == 1:
        people.append(None)  # BYE
        bye = True

    n = len(people)
    rounds = []
    fixed = people[0]
    rest = people[1:]

    for r in range(n - 1):
        current = [fixed] + rest
        round_matches = []
        round_bye = None
        for i in range(n // 2):
            a, b = current[i], current[n - 1 - i]
            if a is None:
                round_bye = b
            elif b is None:
                round_bye = a
            else:
                # Alternate home/away across rounds for fairness
                if r % 2 == 0:
                    round_matches.append([a, b])
                else:
                    round_matches.append([b, a])
        rounds.append({"round": r + 1, "matches": round_matches, "bye": round_bye})
        # rotate: keep fixed in place, rotate the rest clockwise
        rest = [rest[-1]] + rest[:-1]

    return rounds, bye


def double_round_robin(rounds, num_rounds_first_leg):
    """Append a second leg with home/away swapped."""
    second_leg = []
    for rnd in rounds:
        second_leg.append({
            "round": rnd["round"] + num_rounds_first_leg,
            "matches": [[b, a] for a, b in rnd["matches"]],
            "bye": rnd["bye"],
        })
    return rounds + second_leg


def main():
    ap = argparse.ArgumentParser(description="Generate round-robin fixtures for any number of participants.")
    ap.add_argument("--participants", help="Comma-separated list of participant names")
    ap.add_argument("--participants-file", help="JSON file: list of names, or list of {group, participants}")
    ap.add_argument("--count", type=int, help="Generate N generic participants (Team 1..Team N)")
    ap.add_argument("--double", action="store_true", help="Generate a double round-robin (home + away legs)")
    args = ap.parse_args()

    def build_for(participants):
        rounds, bye = generate_single_round_robin(participants)
        if args.double:
            rounds = double_round_robin(rounds, len(rounds))
        return {
            "participants": participants,
            "has_bye_round": bye,
            "num_participants": len(participants),
            "matches_per_round": len(participants) // 2,
            "total_rounds": len(rounds),
            "rounds": rounds,
        }

    if args.participants:
        participants = [p.strip() for p in args.participants.split(",") if p.strip()]
        result = build_for(participants)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.participants_file:
        with open(args.participants_file, encoding="utf-8") as f:
            data = json.load(f)
        if data and isinstance(data[0], dict) and "participants" in data[0]:
            # multiple groups
            out = []
            for grp in data:
                r = build_for(grp["participants"])
                r["group"] = grp.get("group")
                out.append(r)
            print(json.dumps(out, ensure_ascii=False, indent=2))
        else:
            result = build_for(data)
            print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.count:
        participants = [f"Team {i+1}" for i in range(args.count)]
        result = build_for(participants)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        ap.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
