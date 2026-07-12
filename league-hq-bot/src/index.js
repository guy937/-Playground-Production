require("dotenv").config();
require("./db").load(); // ensures the data file exists before anything else runs
const { createBot, ALLOWED } = require("./bot");
const { scheduleDigest } = require("./digest");

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in environment. Set it and restart.");
  process.exit(1);
}
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN in environment. Set it and restart.");
  process.exit(1);
}

const bot = createBot();
console.log("Bot is running. Send /whoami to your bot in Telegram to find your chat id.");

if (ALLOWED.length === 0) {
  console.warn(
    "WARNING: ALLOWED_CHAT_IDS is empty — the bot will respond to ANYONE who messages it, " +
    "and the morning digest has no one to send to. Set ALLOWED_CHAT_IDS once you know your chat id(s)."
  );
} else {
  scheduleDigest(bot);
}
