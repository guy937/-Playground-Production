# Venue logistics — the capacity math

This generalizes the core calculation from the original EZ7 padel calculator: given a venue's physical resources and the groups assigned to it, how much time does match day actually need, and where does capacity break down.

## The core formula

For a venue on a given match day:

```
total_matches   = sum of matches_per_round across all groups assigned to that venue
slots_needed    = ceil(total_matches / courts)
duration        = slots_needed × slot_length_minutes
time_window     = start_time  →  start_time + duration
```

`courts` generalizes to whatever the physical constraint is for the sport: courts, fields, lanes, tables, mats. `matches_per_round` for a round-robin group of size N is `floor(N/2)` (this is exactly what `scripts/round_robin.py` reports as `matches_per_round` — reuse that number directly rather than recalculating).

`scripts/venue_scheduler.py` implements this and additionally flags:
- **Over-capacity venues**: if the computed end time runs past a cutoff (default 23:30, configurable via `--cutoff`) — this means the venue needs fewer groups, more courts, or a shorter slot length.
- **Duplicate venue/day entries**: if the same venue+day appears as two separate entries in the input, which understates true load (they should be merged into one entry listing all groups together).

## Things worth checking / advising on, even when not asked

- **Slot length accuracy**: the calculator assumes a fixed slot length (e.g. 60 minutes) uniformly. If prior seasons' actual match durations are available in the project, compare — actual games often run longer than the assumed slot, and flag this as a scheduling risk (games spilling past the booked window) rather than silently accepting the assumption.
- **Uneven load across venues**: if one venue is packed to its cutoff time while another sits at low utilization, that's worth surfacing — the league may want to rebalance which groups play where.
- **Travel/rest between rounds**: not modeled here yet, but worth asking about if participants play multiple matches in a single day across different time slots.
- **Facility approval status**: the original calculator tracked venue status (approved / pending / waiting / inactive) as venues get confirmed over the course of building out a season. If the user is still in the process of locking in venues, ask which of these each venue is at before treating its capacity numbers as final — a "pending" or "waiting" venue's court count might still change.

## Extending this

If a new sport uses a genuinely different resource constraint (e.g. water lanes with time-of-day pricing, or a facility shared across two different sports competing for the same courts), extend `scripts/venue_scheduler.py` rather than working around it manually — the conflict-detection logic should grow to cover the new constraint so future seasons benefit automatically.
