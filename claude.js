const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const store = require("./db");
const tasksLib = require("./tasks");
const roundRobin = require("./leagueTools/roundRobin");
const venueScheduler = require("./leagueTools/venueScheduler");
const standingsLib = require("./leagueTools/standings");
const { generateDocx } = require("./docGen/docx");
const { generateXlsx } = require("./docGen/xlsx");
const { generatePptx } = require("./docGen/pptx");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

// ---- Build the system prompt from the bundled skills -----------------
// This is the Phase-1 approach: load every skill's full SKILL.md into the
// system prompt so the bot's judgment matches what you get from these
// skills in Cowork. This works fine for 5 skills (well within context
// limits). If the skill library grows a lot, switch to a routing step
// (ask Claude which skill's SKILL.md to load, matching Cowork's own
// progressive-disclosure pattern) instead of loading everything up front.
function loadSkills() {
  const skillsDir = path.join(__dirname, "..", "skills");
  const names = fs.readdirSync(skillsDir).filter((n) =>
    fs.statSync(path.join(skillsDir, n)).isDirectory()
  );
  return names
    .map((name) => {
      const skillMdPath = path.join(skillsDir, name, "SKILL.md");
      if (!fs.existsSync(skillMdPath)) return null;
      const content = fs.readFileSync(skillMdPath, "utf-8");
      return `<skill name="${name}">\n${content}\n</skill>`;
    })
    .filter(Boolean)
    .join("\n\n");
}

const SKILLS_BLOCK = loadSkills();

function buildSystemPrompt() {
  return `You are the internal assistant for a sports league / IP production company, reachable by the two people who run the business directly from their phones via Telegram. You have several bundled "skills" below — each is a playbook for a specific part of the business (sponsorship proposals, player/talent agreements, event operations, sponsor ROI reporting, league/competition management). Read the relevant skill's instructions before doing that kind of task, the same way you would in a full Claude session.

Respond in whichever language the user writes in (this business operates primarily in Hebrew). Keep the chat reply itself concise — this is a phone chat, not a document — but don't let that shrink the actual *content* of a generated file: a quote, proposal, or table should be as complete as the skill instructions call for, even if your chat message just says "here it is" alongside it.

You have tools to manage a shared task list (add_task / list_tasks / complete_task), tools to generate real files (generate_docx / generate_xlsx / generate_pptx) that get sent back as Telegram documents, and tools that run the league-manager math directly (round_robin_schedule / venue_schedule / compute_standings — same logic as the Python scripts in skills/league-manager/scripts, just callable natively here). Use these whenever the matching skill's "Output format" section calls for that kind of deliverable — e.g. sponsorship-proposal-builder's rate cards become generate_xlsx calls, its pitch decks become generate_pptx, its הצעת מחיר and one-pagers become generate_docx.

Don't silently add tasks the user didn't ask you to track — ask if it's ambiguous whether something should become a tracked task. Likewise, never fabricate numbers (pricing, audience figures, ח.פ./tax numbers, VAT treatment) in a generated document — ask for anything you don't actually know, exactly as the skills instruct.

When calling generate_docx, structure content as a "blocks" array: {type:"heading", text, level} (level 1 or 2), {type:"paragraph", text, bold?}, {type:"table", headers, rows}, {type:"spacer"}. Default rtl:true for Hebrew content.
When calling generate_xlsx, pass "sheets": [{name, headers, rows, rtl?}].
When calling generate_pptx, pass "slides": [{title, bullets?, table?:{headers,rows}}].

--- BUNDLED SKILLS ---

${SKILLS_BLOCK}
`;
}

const TOOLS = [
  {
    name: "add_task",
    description: "Add a new task to the shared team task list.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short description of the task" },
        owner: { type: "string", description: "Who's responsible, if mentioned" },
        due_date: { type: "string", description: "Due date, in whatever form the user gave it" },
        notes: { type: "string", description: "Any extra context" },
      },
      required: ["title"],
    },
  },
  {
    name: "list_tasks",
    description: "List open (not yet completed) tasks on the shared task list.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "complete_task",
    description:
      "Mark a task as done. Provide either the numeric task id if known, or a text fragment matching the task title.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "Numeric task id, if known" },
        title_fragment: { type: "string", description: "Partial title text to find the task by, if id isn't known" },
      },
    },
  },
  {
    name: "generate_docx",
    description:
      "Generate a real Word document and send it back to the user as a Telegram file attachment. Use for one-pagers, player/talent agreement drafts, and הצעת מחיר (formal price quotes).",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "File name without extension, e.g. 'quote-puma-2026'" },
        title: { type: "string", description: "Document title, shown at the top" },
        rtl: { type: "boolean", description: "Right-to-left layout, default true for Hebrew content" },
        blocks: {
          type: "array",
          description: "Ordered content blocks — heading/paragraph/table/spacer, see system prompt for shape",
          items: { type: "object" },
        },
      },
      required: ["filename", "blocks"],
    },
  },
  {
    name: "generate_xlsx",
    description:
      "Generate a real Excel workbook and send it back as a Telegram file attachment. Use for rate cards, budgets, staffing sheets, fixture lists, standings tables.",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "File name without extension" },
        sheets: {
          type: "array",
          description: "Array of {name, headers, rows, rtl?}",
          items: { type: "object" },
        },
      },
      required: ["filename", "sheets"],
    },
  },
  {
    name: "generate_pptx",
    description:
      "Generate a real PowerPoint deck and send it back as a Telegram file attachment. Use for sponsorship pitch decks and sponsor ROI recap decks.",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "File name without extension" },
        rtl: { type: "boolean", description: "Right-to-left text alignment, default true" },
        slides: {
          type: "array",
          description: "Array of {title, bullets?: string[], table?: {headers, rows}}",
          items: { type: "object" },
        },
      },
      required: ["filename", "slides"],
    },
  },
  {
    name: "round_robin_schedule",
    description:
      "Generate a round-robin fixture schedule for any number of participants (handles odd counts with a bye automatically). Matches the league-manager skill's round_robin.py logic exactly.",
    input_schema: {
      type: "object",
      properties: {
        groups: {
          type: "array",
          description: "One or more groups: [{group: name, participants: [...]}]",
          items: {
            type: "object",
            properties: {
              group: { type: "string" },
              participants: { type: "array", items: { type: "string" } },
            },
            required: ["participants"],
          },
        },
        double: { type: "boolean", description: "Double round-robin (home + away legs), default false" },
      },
      required: ["groups"],
    },
  },
  {
    name: "venue_schedule",
    description:
      "Compute per-venue time windows and capacity conflicts given courts, assigned groups, slot length, and start time. Matches the league-manager skill's venue_scheduler.py logic exactly.",
    input_schema: {
      type: "object",
      properties: {
        venues: {
          type: "array",
          description:
            "[{name, courts, day, start_time (HH:MM), slot_minutes, groups: [{name, matches_per_round}]}]",
          items: { type: "object" },
        },
        cutoff: { type: "string", description: "Latest acceptable end time HH:MM, default 23:30" },
      },
      required: ["venues"],
    },
  },
  {
    name: "compute_standings",
    description:
      "Build a points table from match results. Matches the league-manager skill's standings.py logic exactly.",
    input_schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          description: "[{group, a, b, score_a, score_b}]",
          items: { type: "object" },
        },
        points_win: { type: "integer", description: "Default 3" },
        points_draw: { type: "integer", description: "Default 1" },
        points_loss: { type: "integer", description: "Default 0" },
      },
      required: ["results"],
    },
  },
];

// `generatedFiles` is an out-param array — file-producing tools push
// {file_path, filename} onto it so the caller can send them via Telegram
// after the tool-use loop finishes, without threading return values
// through every layer.
async function runTool(name, input, chatId, generatedFiles) {
  if (name === "add_task") {
    const task = tasksLib.addTask({ ...input, created_by: String(chatId) });
    return { ok: true, task };
  }
  if (name === "list_tasks") {
    return { ok: true, tasks: tasksLib.listOpenTasks() };
  }
  if (name === "complete_task") {
    if (input.id) {
      const task = tasksLib.completeTask(input.id);
      return task ? { ok: true, task } : { ok: false, error: "No task with that id." };
    }
    if (input.title_fragment) {
      const matches = tasksLib.findOpenTaskByTitle(input.title_fragment);
      if (matches.length === 1) {
        const task = tasksLib.completeTask(matches[0].id);
        return { ok: true, task };
      }
      if (matches.length > 1) {
        return { ok: false, error: "Multiple matching tasks, ask the user which one.", matches };
      }
      return { ok: false, error: "No open task matched that text." };
    }
    return { ok: false, error: "Need either an id or title_fragment." };
  }
  if (name === "generate_docx") {
    try {
      const result = await generateDocx(input);
      generatedFiles.push({ file_path: result.file_path, filename: result.filename });
      return { ok: true, filename: result.filename, note: "File generated, will be sent to the user as an attachment." };
    } catch (err) {
      return { ok: false, error: `docx generation failed: ${err.message}` };
    }
  }
  if (name === "generate_xlsx") {
    try {
      const result = await generateXlsx(input);
      generatedFiles.push({ file_path: result.file_path, filename: result.filename });
      return { ok: true, filename: result.filename, note: "File generated, will be sent to the user as an attachment." };
    } catch (err) {
      return { ok: false, error: `xlsx generation failed: ${err.message}` };
    }
  }
  if (name === "generate_pptx") {
    try {
      const result = await generatePptx(input);
      generatedFiles.push({ file_path: result.file_path, filename: result.filename });
      return { ok: true, filename: result.filename, note: "File generated, will be sent to the user as an attachment." };
    } catch (err) {
      return { ok: false, error: `pptx generation failed: ${err.message}` };
    }
  }
  if (name === "round_robin_schedule") {
    try {
      const fixtures = roundRobin.buildFixturesForGroups(input.groups, { double: !!input.double });
      return { ok: true, fixtures };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  if (name === "venue_schedule") {
    try {
      const result = venueScheduler.computeSchedule(input.venues, input.cutoff || "23:30");
      return { ok: true, ...result };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  if (name === "compute_standings") {
    try {
      const standings = standingsLib.buildStandings(
        input.results,
        input.points_win ?? 3,
        input.points_draw ?? 1,
        input.points_loss ?? 0
      );
      return { ok: true, standings };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  return { ok: false, error: `Unknown tool: ${name}` };
}

// ---- Conversation history (persisted so a redeploy doesn't lose context) ----
function loadHistory(chatId, limit = 20) {
  const s = store.load();
  return s.messages
    .filter((m) => m.chat_id === String(chatId))
    .slice(-limit)
    .map((m) => ({ role: m.role, content: m.content }));
}

function saveMessage(chatId, role, content) {
  const s = store.load();
  s.messages.push({ chat_id: String(chatId), role, content, created_at: new Date().toISOString() });
  // Keep only the last 200 messages per chat so the file doesn't grow forever.
  const forThisChat = s.messages.filter((m) => m.chat_id === String(chatId));
  if (forThisChat.length > 200) {
    const toDrop = forThisChat.length - 200;
    let dropped = 0;
    s.messages = s.messages.filter((m) => {
      if (m.chat_id === String(chatId) && dropped < toDrop) {
        dropped += 1;
        return false;
      }
      return true;
    });
  }
  store.save(s);
}

// ---- Main entry point: send a user message, get Claude's reply ----
// Returns { text, files } — files is a list of {file_path, filename} for
// any documents generated during this turn, which the caller (bot.js)
// should send as Telegram attachments and then delete from disk.
async function chat(chatId, userText) {
  saveMessage(chatId, "user", userText);
  const history = loadHistory(chatId);

  let messages = [...history];
  let finalText = "";
  const generatedFiles = [];

  // Tool-use loop: Claude may call a tool, we run it, feed the result back,
  // and loop until it produces a plain text reply. Document generation can
  // involve large content, so allow a generous max_tokens.
  for (let turn = 0; turn < 6; turn++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: buildSystemPrompt(),
      tools: TOOLS,
      messages,
    });

    const toolUses = response.content.filter((b) => b.type === "tool_use");
    const textBlocks = response.content.filter((b) => b.type === "text");
    finalText = textBlocks.map((b) => b.text).join("\n").trim();

    if (toolUses.length === 0) {
      break; // plain text reply, we're done
    }

    // Record the assistant turn (including tool_use blocks) then the tool results
    messages.push({ role: "assistant", content: response.content });
    const toolResults = [];
    for (const tu of toolUses) {
      const result = await runTool(tu.name, tu.input, chatId, generatedFiles);
      toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(result) });
    }
    messages.push({ role: "user", content: toolResults });
  }

  saveMessage(chatId, "assistant", finalText || "(no reply generated)");
  return { text: finalText || "משהו השתבש - נסה שוב.", files: generatedFiles };
}

module.exports = { chat, buildSystemPrompt };
