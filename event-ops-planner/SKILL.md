---
name: event-ops-planner
description: Build operations documents for running sports league events — run-of-show/production schedules, event budgets, staffing/crew sheets, and venue logistics checklists. Use this whenever the user is planning an upcoming event or matchday, needs a run-of-show, is budgeting an event, building a staffing plan, or asks something like "help me plan out matchday for the [event name]" or "what's our budget looking like for the next event." This covers recurring league events (many events per season), not one-off unrelated planning. Complements the sponsorship and contract-review skills — deliverables owed to sponsors for a given event (from a signed contract) should be checked against the run-of-show to make sure they're actually scheduled in.
---

## Overview

This skill helps a sports league/IP production company plan the operational side of running recurring events — the run-of-show, the budget, and the staffing behind each matchday or event. Because events recur throughout a season, these documents benefit from being built as reusable templates (same structure, refreshed per event) rather than one-offs — ask the user if they have a prior event's docs to reuse as a base before starting from scratch.

## Ask before building

1. **Which document** — run-of-show/production schedule, budget, staffing sheet, or a full event pack combining all three?
2. **Event basics** — event name, date, venue, expected attendance, and whether sponsors have contracted deliverables that need to be scheduled in (check with the user or the project's contracts if a sponsor deck/contract is referenced)
3. Is there a prior event's docs in the project to use as a template?

## Run-of-show / production schedule

A timed, minute-by-minute (or block-by-block) schedule of everything happening on event day. Structure as a table:

- **Time** | **Activity** | **Location/zone** | **Owner (who's responsible)** | **Notes/dependencies**

Cover, in order, whatever applies: venue access/load-in, vendor/equipment setup, staff call times, doors open, warm-ups, sponsor activations (pull exact timing/placement from the sponsor's contracted deliverables so nothing contracted gets missed — e.g. a halftime activation or a naming-rights banner reveal), competition/match segments, broadcast windows, player/talent appearances, load-out.

Flag any sponsor deliverable that doesn't have a clear slot in the schedule — that's a contract compliance risk, not just a scheduling gap.

## Event budget

Build as a spreadsheet with line items grouped by category (adjust categories to what the user already tracks):

- **Venue** (rental, insurance, security deposit)
- **Production** (staging, AV, broadcast, signage build)
- **Talent/player** (fees, travel, accommodation — cross-reference agreements from the player/talent agreement skill if amounts are already contracted)
- **Staffing/crew** (day-of staff, security, medical)
- **Marketing/sponsor activation costs** (anything the league itself pays for to fulfill sponsor deliverables)
- **Contingency** (typically 5-10% of total — ask if the user has a standard rate)

Columns: line item, budgeted amount, actual/committed amount, variance, notes. If the user has run prior events, compare against actuals from those to sanity-check estimates.

## Staffing / crew sheet

Table with: role, name (if assigned), call time, end time, zone/responsibility, contact info, whether they're internal staff or a contracted vendor (cross-reference the supplier/vendor contract if one exists for that role, e.g. contracted security or medical staff).

## Output format

- Use the **xlsx** skill for budgets and staffing sheets (formulas for totals/variance are useful).
- Use the **docx** skill for the run-of-show if it reads better as a formatted document, or **xlsx** if the user wants to sort/filter by time or owner.
- If asked for a full "event pack," combine into one docx with the run-of-show as the main body and budget/staffing as appendix tables, or keep as separate files — ask the user's preference if unclear.
