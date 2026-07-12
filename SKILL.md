---
name: sponsor-roi-reporting
description: Build post-event or post-season sponsor performance reports showing reach, exposure, and whether contracted deliverables were fulfilled, for a sports league/IP production company reporting back to its sponsors. Use this whenever the user wants a sponsor recap, needs to show a sponsor their ROI, is preparing a renewal pitch backed by past performance data, or asks something like "what do we show [sponsor] after the event" or "put together the recap for the season." This is the follow-up step after an event runs and after a sponsorship deal was signed — pairs with the sponsorship-proposal-builder skill (which sells the deal) and the contract-review skill (which has the contracted deliverables to report against).
---

## Overview

This skill turns raw event data (attendance, impressions, social metrics, activation photos, media mentions) into a report showing a sponsor what they got for their money. This matters most at renewal time — a strong recap is often the best sales tool for the next season's ask, so treat this as connected to (not separate from) the sponsorship-proposal-builder skill.

## Ask before building

1. **Which sponsor and which contract/deal** — pull the contracted deliverables list first (from the signed agreement, or ask the user to paste/upload it) so the report is structured around what was promised, not just what's easy to measure.
2. **What data is available** — attendance numbers, broadcast/stream viewership, social media metrics (impressions, engagement, follower growth from tagged posts), photos/proof of activation (signage, jersey branding, on-site booth), media coverage/press mentions.
3. **Scope** — single event or full-season recap across multiple events?
4. **Output** — a formal recap deck for a sponsor meeting (.pptx), an internal tracking sheet (.xlsx), or a written report (.docx)?

Never estimate or round up numbers the user hasn't provided — ask, or mark fields as `[pending data]`. A recap with fabricated metrics is worse than no recap.

## Structure: deliverables-vs-actual tracking

Build the core of the report as a table, one row per contracted deliverable:

**Deliverable (from contract)** | **Committed** (what was promised — e.g. "2x court-side banners, all home games") | **Delivered** (what actually happened) | **Status** (fulfilled / partially fulfilled / not fulfilled) | **Evidence** (photo reference, screenshot, metric)

Flag any deliverable marked partially/not fulfilled clearly — this needs to be addressed with the sponsor proactively, not buried. Better to surface it now than have the sponsor notice at renewal time.

## Reach & exposure metrics

Where available, report:
- **Attendance** (per event and cumulative for a season recap)
- **Broadcast/streaming reach** (viewers, hours watched, markets reached)
- **Social media** (impressions/reach for tagged or branded content, engagement rate, follower growth attributable to the partnership if trackable)
- **Media/press mentions** (count and notable placements, especially any mentioning the sponsor by name)
- **Estimated media value (EMV)** if the user has a methodology for converting impressions/exposure into an equivalent ad-spend value — only include if the user confirms the methodology, since EMV calculations vary widely and a sponsor may scrutinize the number

## Output format

- Use the **xlsx** skill for the underlying deliverables-vs-actual tracker and any metrics data — useful for internal tracking across many sponsors/deals.
- Use the **pptx** skill for the sponsor-facing recap deck — visual, one deliverable or metric theme per slide, include photos of activations if the user has them.
- Use the **docx** skill if a written narrative report is preferred over a deck.

Close every sponsor-facing recap with a forward-looking section — what renewal or expanded package could look like next season — since this report often doubles as the opening move in the next sales conversation.
