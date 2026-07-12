# League HQ Bot

An internal Telegram bot backed by Claude, so you and your partner can chat with an assistant that knows your business's playbooks (sponsorship proposals, player/talent agreements, event ops, sponsor ROI, league management), track a shared task list by just talking to it, get a morning digest of open tasks, and receive real Word/Excel/PowerPoint files and league schedules generated on the spot.

## What this does

- Chat with Claude from Telegram, on your phone, anytime.
- The bot's judgment is shaped by the 5 skills bundled in `skills/` — same playbooks used in your Cowork sessions, copied in as plain instructions.
- Add / list / complete tasks just by talking naturally ("תוסיף משימה לשלוח חוזה לבית ברל עד יום רביעי", "מה פתוח?", "סמן את המשימה של הצעת המחיר כבוצעה").
- Every morning at a time you set, both of you get a Telegram message summarizing open tasks.
- **Generates real files, sent straight into the chat**: ask for a הצעת מחיר, a sponsorship rate card, a one-pager, a pitch deck, or an ROI recap, and it produces an actual .docx/.xlsx/.pptx and sends it as a Telegram attachment — no need to open Cowork separately.
- **Runs the league-manager scheduling logic directly**: round-robin fixtures for any number of participants (handles byes automatically), venue time-window/capacity calculations, and standings tables — same math as the `league-manager` skill's Python scripts, ported to JS so the bot can call it natively (no separate Python runtime needed on the host).

## What this does NOT do yet (Phase 3, not built)

- **No web dashboard.** The task list lives in a JSON file this bot manages; there's no visual dashboard yet (your existing HTML dashboard isn't wired to this — that's a natural next step if you want a browser view alongside the Telegram chat).
- **No photos/voice messages.** The bot only reads text messages for now.
- **No multi-file "packages"** (e.g. deck + rate card + quote in one request) — ask for one document at a time for now; multi-document requests will only produce the last one it generates in a single reply.

Say the word when you want any of these built next.

## Example things to ask it, once deployed

- "תבנה לי הצעת מחיר לפומה - חסות קטגוריה 50,000 ש״ח לעונה, מיתוג מגרש 10,000 ש״ח" → generates and sends a real .docx quote
- "תעשה לי כרטיס מחירים לכל שכבות החסות" → generates a real .xlsx
- "תבנה לוח משחקים לבית עם 6 זוגות: דני, יוסי, רון, איתי, עומר, גיל" → runs the real round-robin algorithm and can turn it into a file if you ask
- "יש לי 3 מתחמים עם 8, 6 ו-4 מגרשים, כל אחד עם 2 בתים - תבדוק אם יש התנגשות" → runs the venue capacity check

---

## Setup — step by step

### 1. Create your Telegram bot

1. Open Telegram, search for **@BotFather**, start a chat.
2. Send `/newbot`, give it a name and a username (must end in `bot`, e.g. `LeagueHQ_bot`).
3. BotFather gives you a token like `123456789:AAExample-Token`. Save it — this is your `TELEGRAM_BOT_TOKEN`.

### 2. Get your Anthropic API key

You said you already have an Anthropic API account at [console.anthropic.com](https://console.anthropic.com). Go to **API Keys** and create one if you don't already have a key you want to use for this. This is billed separately from any Claude.ai/Cowork subscription — usage here is pay-as-you-go per token.

### 3. Deploy to Railway (recommended — simplest path with nothing set up yet)

1. Push this folder to a new GitHub repo (private is fine).
2. Go to [railway.app](https://railway.app), sign in with GitHub, click **New Project → Deploy from GitHub repo**, pick this repo.
3. Railway detects Node.js and runs `npm install` + `npm start` automatically.
4. In the Railway project, go to **Variables** and add:
   - `ANTHROPIC_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `ANTHROPIC_MODEL` = `claude-sonnet-5`
   - `TIMEZONE` = `Asia/Jerusalem`
   - `DIGEST_HOUR` = `8`
   - `DIGEST_MINUTE` = `0`
   - Leave `ALLOWED_CHAT_IDS` empty for now — you'll set it in step 4.
5. **Attach a volume** (Railway → your service → Settings → Volumes) mounted at `/app/data` — without this, your tasks and chat history (stored in a simple JSON file, no database server needed) reset every time you redeploy. This matters once you're relying on the task list for real.
6. Deploy. Check the logs — you should see `Bot is running.`

### 4. Find your chat ID and lock the bot down

1. In Telegram, message your new bot anything, then send `/whoami`.
2. It replies with your numeric chat id. Do the same from your partner's phone.
3. Back in Railway, set `ALLOWED_CHAT_IDS` to both ids, comma-separated (e.g. `111111111,222222222`).
4. Redeploy. Now only you two can use the bot, and the morning digest goes to both of you.

### 5. Try it

Message the bot naturally, in Hebrew or English:
- "מה פתוח?" → lists open tasks
- "תוסיף משימה: לשלוח הצעת מחיר לפומה עד יום חמישי" → adds a task
- "תעזור לי לבנות הצעת חסות לנייקי" → walks through the sponsorship-proposal-builder skill's questions, in chat
- Wait for tomorrow morning's digest, or lower `DIGEST_HOUR`/`DIGEST_MINUTE` temporarily to test sooner.

---

## Local development (optional, before deploying)

```bash
npm install
cp .env.example .env   # fill in your real keys
npm start
```

## Project structure

```
league-hq-bot/
├── src/
│   ├── index.js         entrypoint — starts bot + schedules digest
│   ├── bot.js            Telegram wiring, allowlist, message handling, sends generated files
│   ├── claude.js         builds system prompt from skills/, runs the tool-use loop
│   ├── digest.js         morning summary logic + cron schedule
│   ├── db.js             JSON file store (tasks + message history)
│   ├── tasks.js          task CRUD helpers
│   ├── leagueTools/      JS ports of the league-manager skill's Python scripts
│   │   ├── roundRobin.js
│   │   ├── venueScheduler.js
│   │   └── standings.js
│   └── docGen/           real file generation (pure JS, no native deps)
│       ├── docx.js
│       ├── xlsx.js
│       └── pptx.js
├── skills/               copies of your 5 Cowork skills' SKILL.md files
├── data/                 JSON store + generated files land here (attach a Railway volume for the store; generated files are deleted right after sending)
├── .env.example
└── package.json
```

## Updating the skills

When you improve a skill in Cowork (like you just did with the Hebrew price quote addition), copy the updated `SKILL.md` into `skills/<skill-name>/SKILL.md` here and redeploy, so the bot's judgment stays in sync with what you get in Cowork.
