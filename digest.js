const cron = require("node-cron");
const Anthropic = require("@anthropic-ai/sdk");
const tasksLib = require("./tasks");
const { ALLOWED } = require("./bot");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

async function buildDigestText() {
  const open = tasksLib.listOpenTasks();

  if (open.length === 0) {
    return "בוקר טוב! אין משימות פתוחות כרגע. יום נקי – תהנו ממנו.";
  }

  const taskLines = open
    .map((t) => `- [#${t.id}] ${t.title}${t.owner ? ` (${t.owner})` : ""}${t.due_date ? ` — יעד: ${t.due_date}` : ""}`)
    .join("\n");

  // Ask Claude to phrase a short, useful morning summary rather than just
  // dumping the raw list — flag anything that looks overdue/urgent based on
  // the due_date text, and keep it tight since this lands on a phone at 8am.
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system:
      "You write short, friendly Hebrew morning digest messages for a two-person sports league business, based on their open task list. Be concise (this is a phone notification, not a report). Group by urgency if anything looks overdue or due today/soon. End with a one-line encouraging note. Do not invent tasks that aren't in the list.",
    messages: [
      {
        role: "user",
        content: `Today's open tasks:\n${taskLines}\n\nWrite the morning digest message in Hebrew.`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return text || `בוקר טוב! המשימות הפתוחות שלכם:\n${taskLines}`;
}

function scheduleDigest(bot) {
  const hour = parseInt(process.env.DIGEST_HOUR || "8", 10);
  const minute = parseInt(process.env.DIGEST_MINUTE || "0", 10);
  const timezone = process.env.TIMEZONE || "Asia/Jerusalem";
  const cronExpr = `${minute} ${hour} * * *`;

  cron.schedule(
    cronExpr,
    async () => {
      try {
        const text = await buildDigestText();
        for (const chatId of ALLOWED) {
          await bot.sendMessage(chatId, text);
        }
      } catch (err) {
        console.error("Failed to send morning digest:", err);
      }
    },
    { timezone }
  );

  console.log(`Morning digest scheduled for ${hour}:${String(minute).padStart(2, "0")} (${timezone})`);
}

module.exports = { scheduleDigest, buildDigestText };
