---
name: league-manager
description: Run the competition side of a sports league/IP business — building fixture schedules (who plays whom, when, and where), assigning groups/pools to venues without overbooking courts or facilities, tracking results, and generating standings. Use this whenever the user wants to schedule league matchdays, build a bracket or round-robin, assign houses/groups/pools to venues, plan practice/game time windows for a facility, or update a league table after results come in — even if phrased casually like "help me set the schedule for the next round" or "who plays who this week" or "can you update the standings." This is the operational backbone for running the competition itself (distinct from event-ops-planner, which handles matchday logistics like staffing/budget, and distinct from sponsor-facing skills). Designed to be extended over time to new formats and new sports — always check references/ for the right format before improvising fixture logic by hand.
---

## Overview

This skill is the backbone for running the competition itself: turning "N teams/pairs need to play each other" into an actual schedule with dates, venues, and time slots, then tracking results and standings as the season plays out. It was built from a real padel league calculator (EZ7 Padel Tour — houses of pairs, venues with courts, weekly round-robin), but everything here is written to generalize past that one case, because the business plans to run more formats and more sports over time. When you hit a gap this skill doesn't cover yet, extend it (see "Extending this skill" below) rather than solving it ad hoc and throwing the logic away.

**Core idea — three separable problems:**
1. **Format** — how many participants, how they're grouped, and what schedule structure applies (round-robin, knockout, groups + playoffs, swiss). See `references/formats.md`.
2. **Venue logistics** — given a schedule, which physical location and time slot each match happens in, without overbooking courts/fields. See `references/venue-logistics.md`.
3. **Standings** — turning results into a ranked table. Handled by `scripts/standings.py`.

Don't compute round-robin pairings or venue time windows by hand — use the bundled scripts. They're deterministic, already tested against the real calculator's numbers, and will save you from subtle bracket-generation bugs (e.g. round-robin scheduling is a classic place to get pairings almost-but-not-quite right).

## Workflow

1. **Establish the structure.** Ask (if not already given): how many groups/pools/houses, how many participants per group (this changes season to season — never assume a fixed number like 6), and which format (round-robin is the default seen so far; ask if it's something else).
2. **Generate fixtures** with `scripts/round_robin.py`. Pass participants per group (a JSON file of `{"group": ..., "participants": [...]}` objects handles multiple groups in one call). Use `--double` if the season plays a full season and return leg.
3. **Assign groups to venues and compute time windows** with `scripts/venue_scheduler.py`. This needs, per venue: court count, which groups play there, slot length, and start time. It outputs the time window each venue needs and flags conflicts (over-capacity venues, duplicate venue/day entries). Read `references/venue-logistics.md` for the underlying model (it mirrors the "courts × slot length → time window" math from the original calculator, generalized to any court-based or lane-based sport).
4. **Deliver the schedule.** Default to an **xlsx** fixture list (one row per match: group, round/week, date, venue, time, participant A, participant B) — use the xlsx skill. If the user wants a narrative matchday doc instead, use the docx skill.
5. **As results come in**, run `scripts/standings.py` on the accumulated results to produce the league table. Ask what the scoring system is if it's not obvious (win/draw/loss points, or something sport-specific).
6. **Give advice proactively**, not just outputs: flag when a venue is close to or over capacity, note when group sizes are uneven in a way that creates unfair schedules (e.g. one group has a bye every week and others don't), and point out if historical data in the project (previous seasons' fixtures/results) suggests a better default (e.g. "last season this venue's actual games ran 75 minutes, not the 60 minutes assumed here — worth adjusting the slot length").
7. **Learn from prior seasons.** If the project has earlier fixture lists, results, or venue data, check them before generating new ones — reuse real venue names/court counts/participant naming conventions instead of inventing new ones, and carry forward anything the user corrected last time (e.g. a venue that turned out to need a longer slot length).

## Extending this skill

This skill is meant to be a foundation, not a one-off. When a new need comes up that doesn't fit the current scripts/references:
- **New tournament format** (knockout, swiss, groups + playoffs) → add a new file under `references/formats.md` describing it (or split into `references/knockout.md` etc. if it grows large), and if it needs its own deterministic generation logic (e.g. bracket seeding), add a script under `scripts/` rather than reasoning it out from scratch each time.
- **New sport** → the existing scripts are already sport-agnostic (generic "participants," generic "courts," generic score fields) — usually no code changes needed, just different input data. If a sport has a genuinely different structure (e.g. a sport with byes/promotion-relegation, or ladder formats), add a reference file for it.
- **New venue/logistics wrinkle** (e.g. shared courts across multiple sports, weather-dependent outdoor venues) → extend `references/venue-logistics.md` and `scripts/venue_scheduler.py` rather than solving it inline in conversation, so the next invocation of this skill benefits too.

## Output format

Default to **xlsx** for fixture lists and standings tables (sortable/filterable, and easy to hand to venues or post publicly). Use **docx** if the user wants a written matchday announcement or bracket document instead. Always show the underlying script output (or a summary of it) before formatting into a deliverable, so the user can catch anything before it's finalized.
