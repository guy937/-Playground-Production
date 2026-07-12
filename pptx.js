const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const OUT_DIR = path.join(__dirname, "..", "..", "data", "generated");

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

// slides: [{ title, bullets?: string[], table?: { headers, rows } }]
// Kept intentionally simple (title + bullets + optional table per slide) —
// good enough for sponsorship pitch decks and ROI recap slides without
// getting into full custom layout design.
async function generatePptx({ filename, slides, rtl = true }) {
  ensureOutDir();
  const pres = new PptxGenJS();
  pres.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pres.layout = "WIDE";

  const align = rtl ? "right" : "left";

  for (const slideDef of slides) {
    const slide = pres.addSlide();
    slide.addText(slideDef.title || "", {
      x: 0.5,
      y: 0.4,
      w: 12.3,
      h: 0.9,
      fontSize: 28,
      bold: true,
      align,
      color: "0B1D3A",
    });

    let cursorY = 1.5;

    if (slideDef.bullets && slideDef.bullets.length) {
      slide.addText(
        slideDef.bullets.map((b) => ({ text: b, options: { bullet: true, align, breakLine: true } })),
        { x: 0.7, y: cursorY, w: 11.9, h: 4.5, fontSize: 18, color: "13203A" }
      );
      cursorY += 4.6;
    }

    if (slideDef.table && slideDef.table.headers) {
      const headerRow = slideDef.table.headers.map((h) => ({
        text: String(h),
        options: { bold: true, fill: { color: "F0EEE6" }, align },
      }));
      const dataRows = (slideDef.table.rows || []).map((row) =>
        row.map((cell) => ({ text: String(cell), options: { align } }))
      );
      slide.addTable([headerRow, ...dataRows], {
        x: 0.5,
        y: cursorY,
        w: 12.3,
        fontSize: 14,
        border: { type: "solid", color: "E2E0D8", pt: 1 },
      });
    }
  }

  const safeName = filename.endsWith(".pptx") ? filename : `${filename}.pptx`;
  const filePath = path.join(OUT_DIR, safeName);
  await pres.writeFile({ fileName: filePath });
  return { ok: true, file_path: filePath, filename: safeName };
}

module.exports = { generatePptx };
