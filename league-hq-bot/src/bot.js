const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const { chat } = require("./claude");

const ALLOWED = (process.env.ALLOWED_CHAT_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowed(chatId) {
  if (ALLOWED.length === 0) return true; // no allowlist set — open (fine for initial testing only)
  return ALLOWED.includes(String(chatId));
}

function createBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set — see README for how to get one from @BotFather.");
  }
  const bot = new TelegramBot(token, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    // Helper command so you can find your own chat id to put in ALLOWED_CHAT_IDS
    if (msg.text === "/whoami") {
      bot.sendMessage(chatId, `chat id: ${chatId}`);
      return;
    }

    if (!isAllowed(chatId)) {
      bot.sendMessage(chatId, "המשתמש הזה לא מורשה להשתמש בבוט הזה.");
      return;
    }

    if (!msg.text) return; // ignore non-text messages for now (photos, voice, etc.)

    bot.sendChatAction(chatId, "typing");
    try {
      const { text, files } = await chat(chatId, msg.text);
      // Telegram messages cap around 4096 chars — split if needed.
      const chunks = text.match(/[\s\S]{1,3900}/g) || [text];
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
      }
      // Send any generated documents as file attachments, then clean up —
      // these are ephemeral (the source data lives in the task store /
      // conversation, not in the file itself), no need to keep them on disk.
      for (const f of files || []) {
        try {
          await bot.sendDocument(chatId, f.file_path, {}, { filename: f.filename });
        } catch (sendErr) {
          console.error(`Failed to send generated file ${f.filename}:`, sendErr);
          bot.sendMessage(chatId, `נוצר קובץ (${f.filename}) אבל השליחה נכשלה - נסה שוב.`);
        } finally {
          fs.unlink(f.file_path, () => {});
        }
      }
    } catch (err) {
      console.error("Error handling message:", err);
      bot.sendMessage(chatId, "משהו נכשל בפנייה ל-Claude. נסה שוב בעוד רגע.");
    }
  });

  bot.on("polling_error", (err) => console.error("Telegram polling error:", err.message));

  return bot;
}

module.exports = { createBot, isAllowed, ALLOWED };
