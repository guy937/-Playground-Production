# Competition formats

## Round-robin (default, fully supported)

Every participant in a group plays every other participant once (single round-robin) or twice, home-and-away (double round-robin). This is the format seen in the original EZ7 padel calculator: groups of pairs ("houses"/"bayit"), each playing a full round-robin over a fixed number of weeks equal to (participants - 1).

Use `scripts/round_robin.py` — it handles any group size, not just 6:
- Even number of participants: everyone plays every round, `n-1` rounds total, `n/2` matches per round.
- Odd number of participants: one participant sits out (bye) each round, rotating fairly; still `n` rounds total (since a bye round is needed for each participant once), `(n-1)/2` matches per round.
- `--double` flag appends a second leg with home/away reversed, doubling the rounds.

Multiple groups running in parallel (e.g. Bayit 1 through Bayit 40) can be generated in one call by passing a JSON file of `{"group": name, "participants": [...]}` objects.

**Group-size changes between seasons**: never hardcode a participant count. Always ask or read it from the current season's roster — the business has already indicated group size varies (was 6, will change).

## Knockout / single elimination

*Not yet built out with a dedicated script.* When needed: standard bracket, participants eliminated after one loss, winner advances. Byes go to top seeds if the field isn't a power of 2. If this comes up, build `scripts/knockout.py` for bracket generation and seeding, and expand this section — don't hand-generate brackets for larger fields, seeding mistakes are easy to make silently.

## Groups + knockout (hybrid)

*Not yet built out.* Common format: round-robin group stage (use `round_robin.py` per group) to seed a knockout bracket for the top N finishers per group. When this is needed, the group stage can reuse the existing script as-is; only the bracket-seeding step from group standings needs new logic.

## Swiss system

*Not yet built out.* Participants paired each round based on similar running scores rather than a fixed schedule, common for large fields where full round-robin isn't feasible. Needs its own pairing algorithm (avoid rematches, balance color/side where relevant) — build a dedicated script if this format is requested rather than approximating pairings manually.

---

**When adding a new format above:** replace its "not yet built out" placeholder with real guidance once it's been used for real, and note which script implements it (matching the pattern used for round-robin).
