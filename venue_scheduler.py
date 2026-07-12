#!/usr/bin/env python3
"""
Venue capacity & time-window calculator, generalized from the EZ7 padel
league calculator's core math (courts x groups x slot length -> the time
window a facility needs on match day), plus a conflict checker for
assigning multiple groups to the same venue/day.

This is sport-agnostic: "courts" can be courts, fields, lanes, tables,
whatever the physical resource is. "groups" (called "houses"/"bayit" in
the padel context) are round-robin pools; each group plays
`matches_per_round` matches per round (see round_robin.py — this is
len(participants)//2, NOT hardcoded to 3).

Usage:
    python venue_scheduler.py --venues-file venues.json

venues.json format (list of venues, each with groups assigned):
[
  {
    "name": "Rishon LeZion - Padel Center",
    "courts": 8,
    "groups": [{"name": "Bayit 1", "matches_per_round": 3}, {"name": "Bayit 2", "matches_per_round": 3}],
    "day": "Monday",
    "start_time": "18:00",
    "slot_minutes": 60
  },
  ...
]

For each venue this computes: total matches that day, slots needed
(ceil(matches / courts)), hours needed, and the resulting time window.
It also flags conflicts: e.g. if the computed time window runs past a
sensible cutoff (default 23:30) the venue is over capacity for that day
and needs either more courts, a longer window, fewer groups, or a
shorter slot length.

Output: JSON to stdout with per-venue results plus a top-level
"conflicts" list of human-readable warnings.
"""
import argparse
import json
import math
import sys


def parse_hhmm(s):
    h, m = s.split(":")
    return int(h) * 60 + int(m)


def fmt_hhmm(total_minutes):
    total_minutes = int(round(total_minutes)) % (24 * 60)
    h, m = divmod(total_minutes, 60)
    return f"{h:02d}:{m:02d}"


def compute_venue(venue, default_cutoff_min=23 * 60 + 30):
    courts = venue.get("courts", 0)
    groups = venue.get("groups", [])
    slot_minutes = venue.get("slot_minutes", 60)
    start = parse_hhmm(venue.get("start_time", "18:00"))

    total_matches = sum(g.get("matches_per_round", 0) for g in groups)
    slots_needed = math.ceil(total_matches / courts) if courts > 0 else 0
    duration_min = slots_needed * slot_minutes
    end = start + duration_min

    warnings = []
    if courts == 0 and total_matches > 0:
        warnings.append(f"{venue.get('name')}: {total_matches} matches assigned but 0 courts recorded.")
    if end > default_cutoff_min:
        warnings.append(
            f"{venue.get('name')}: schedule runs until {fmt_hhmm(end)}, past the {fmt_hhmm(default_cutoff_min)} "
            f"cutoff — reduce groups at this venue, add courts, or shorten the slot length."
        )

    return {
        "name": venue.get("name"),
        "day": venue.get("day"),
        "courts": courts,
        "num_groups": len(groups),
        "total_matches": total_matches,
        "slots_needed": slots_needed,
        "duration_hours": round(duration_min / 60, 2),
        "window": f"{fmt_hhmm(start)}–{fmt_hhmm(end)}" if total_matches > 0 else "—",
        "warnings": warnings,
    }


def check_double_booking(venues):
    """Flag if the same venue+day appears more than once in the input —
    usually a sign two group assignments should have been merged into one
    venue entry instead of split, which would understate real load."""
    seen = {}
    conflicts = []
    for v in venues:
        key = (v.get("name"), v.get("day"))
        if key in seen:
            conflicts.append(
                f"{v.get('name')} on {v.get('day')} appears in more than one entry — merge into a single venue "
                f"entry with all groups listed together so capacity is calculated correctly."
            )
        seen[key] = True
    return conflicts


def main():
    ap = argparse.ArgumentParser(description="Compute venue time windows and flag scheduling conflicts.")
    ap.add_argument("--venues-file", required=True, help="JSON file describing venues and their assigned groups")
    ap.add_argument("--cutoff", default="23:30", help="Latest acceptable end time, HH:MM (default 23:30)")
    args = ap.parse_args()

    with open(args.venues_file, encoding="utf-8") as f:
        venues = json.load(f)

    cutoff_min = parse_hhmm(args.cutoff)
    results = [compute_venue(v, cutoff_min) for v in venues]

    all_warnings = []
    for r in results:
        all_warnings.extend(r["warnings"])
    all_warnings.extend(check_double_booking(venues))

    output = {
        "venues": results,
        "total_venues": len(results),
        "total_matches_all_venues": sum(r["total_matches"] for r in results),
        "conflicts": all_warnings,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
