---
name: sponsorship-proposal-builder
description: Build sponsorship proposals, pitch decks, one-pagers, rate cards, and formal Hebrew price quotes (הצעת מחיר) for a sports league/IP production company pitching brands (footwear, apparel, tech, beverage, payments, etc.) on league or event sponsorship. Always use this whenever the user wants to pitch a sponsor, put together a sponsorship deck, build a rate card or partnership tiers, respond to a brand's inquiry about sponsoring the league, prepare materials ahead of a sponsor meeting or call, or generate a formal quote/הצעת מחיר for a sponsor — even if they don't say the word "sponsorship" explicitly (e.g. "I have a call with Nike next week", "put together something for Puma", "תכין לי הצעת מחיר ללקוח"). This is for creating NEW outbound sponsorship materials, not for reviewing signed contracts (use the contract-review skill for that).
---

## Overview

This skill helps build the commercial materials used to sell sponsorship of a sports league/IP (the business owns and operates recurring league/event properties and monetizes them partly through brand sponsorship). The counterpart to this skill is contract review — this skill is for the *sell* side, before a deal is signed: pitch decks, rate cards, and proposal one-pagers.

## Ask before building

If not already clear from the conversation, ask (briefly, not as an exhaustive interrogation):
1. **Which brand/prospect** is this for, and do we know their category (footwear, apparel, tech, beverage, payments, travel, etc.)?
2. **What's the ask** — title sponsor, category sponsor, single-event activation, or renewal of an existing deal?
3. **What inventory exists** — has the user given you (or is there in the project) a list of assets: jersey/court/venue branding, digital placements, hospitality, player appearance rights, content/social integrations?
4. **Output format** — pitch deck (.pptx), one-page proposal (.docx), rate card (.xlsx), or a combination?

If the user has prior sponsorship decks or rate cards in the project, match their tone, tier names, and pricing structure rather than inventing a new format from scratch — consistency across prospects matters for a league selling multiple sponsorship categories.

## Sponsorship tier structure

Most league sponsorship sits on a tiered ladder. Default structure (adjust to what the user already uses):

- **Title/Presenting sponsor** — naming rights to the league or a marquee event, top-of-house branding, first-refusal on renewal, most exclusivity
- **Category sponsor** — exclusivity within one product category (e.g. "Official Footwear Partner"), moderate branding + digital rights
- **Official supplier/partner** — narrower scope, product-in-kind or smaller cash deals, less exclusivity
- **Single-event activation** — one-off presence at a specific event, no season-long exclusivity

For each tier, define: price/value, category exclusivity, branding rights (jersey, court/venue, digital, broadcast overlay), hospitality (tickets, meet-and-greets, player appearances), content deliverables (social posts, video integrations), and term/renewal terms.

## Deck/proposal structure

When building a pitch deck or proposal, cover (skip sections that don't fit the ask):

1. **The property** — what the league/event is, format, season structure, audience size and demographics
2. **Audience & reach** — attendance, viewership, social following, past growth trajectory (ask the user for numbers rather than inventing them)
3. **Why this brand** — a short, specific rationale connecting the brand's category/positioning to the league's audience (avoid generic "great fit" language — be concrete)
4. **The ask** — the specific tier/package being proposed, with price
5. **What's included** — itemized deliverables for that tier
6. **Past partners / social proof** — logos or names of existing sponsors if the user wants to include them (only with permission)
7. **Next steps** — proposed timeline to close

## הצעת מחיר (formal Hebrew price quote)

Separate from the pitch deck/proposal above — this is the formal, numbered commercial document ("הצעת מחיר") sent to a sponsor once they're ready for pricing in writing, following standard Israeli business-quote conventions. Trigger this whenever the user asks for an "הצעת מחיר", a quote, or a formal price document for a sponsor — in Hebrew, RTL, as a **docx**.

**Ask before building** (unless already known from the project or a prior quote to reuse as a template):
1. **Company details for the header** — company name, ח.פ./עוסק מורשה number, address, contact (phone/email), and logo if available.
2. **Client details** — the sponsoring company's name, contact person, and if relevant their own ח.פ.
3. **VAT treatment** — standard 18% (the current Israeli VAT rate as of 2025–2026) for a domestic client, or 0% export-rate if the sponsor is a foreign company without an Israeli presence (this needs the user to confirm — don't assume).
4. **Payment terms and quote validity** — if not specified, ask; don't invent a default silently since these are commercially binding once sent.
5. **Bank details** — only include if the user wants them on the quote itself for direct payment instructions.

**Standard structure** (right-to-left, Hebrew):
- **כותרת עליונה**: לוגו + שם החברה + ח.פ./עוסק מורשה + כתובת + טלפון/מייל
- **מספר הצעה ותאריך** (מספור עוקב אם יש הצעות קודמות בפרויקט לשמור על רצף)
- **לכבוד**: שם הלקוח/החברה הנחסה, איש קשר
- **פירוט**: טבלת שורות — תיאור הפריט/חבילת החסות, כמות, מחיר יחידה, סה"כ לפני מע"מ
- **סיכום**: סה"כ לפני מע"מ, מע"מ (18% או 0% לפי מה שהוגדר), סה"כ כולל מע"מ
- **תוקף ההצעה** (לדוגמה: "ההצעה בתוקף ל-30 יום מתאריך הוצאתה")
- **תנאי תשלום** (מקדמה, תשלומים, מועדי תשלום)
- **הערות/סעיפים נוספים** (לדוגמה תלות בחתימת הסכם חסות מלא)
- **חתימה**: מקום לחתימת המזמין ותאריך אישור, ופרטי חתימה מטעם החברה

Pull the line-item pricing directly from the tier/rate card structure already defined earlier in this skill rather than re-deriving prices — a quote should match whatever rate card or proposal preceded it exactly, since inconsistency between them is the kind of thing that erodes trust with a sponsor.

## Output format

- Use the **pptx** skill for pitch decks — keep slides visual and light on text; put the itemized deliverables in a table slide.
- Use the **docx** skill for one-page proposals, formal written offers, and the הצעת מחיר document (RTL, Hebrew).
- Use the **xlsx** skill for rate cards — one row per tier/asset, columns for price, exclusivity, availability (sold/available/on hold), useful when the user is tracking multiple prospects against the same inventory.

Never fabricate audience numbers, past sponsor names, or pricing — ask the user for real figures. It's fine to draft placeholder structure with `[insert attendance figure]`-style brackets if the user wants a template to fill in later. The same applies to הצעת מחיר: never invent a ח.פ./עוסק מורשה number, bank details, or VAT treatment — these are legally/financially significant and must come from the user.
