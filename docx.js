const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} = require("docx");

const OUT_DIR = path.join(__dirname, "..", "..", "data", "generated");

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

// `blocks` is a flexible content schema shared with xlsx/pptx generation
// where it makes sense, so Claude only has to learn one shape:
//   { type: "heading", text, level }        level 1 or 2
//   { type: "paragraph", text, bold }
//   { type: "table", headers: [...], rows: [[...]] }
//   { type: "spacer" }
// `rtl` defaults to true since this business operates mainly in Hebrew.
function buildDoc({ title, blocks = [], rtl = true }) {
  const alignment = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const children = [];

  if (title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment,
        bidirectional: rtl,
        children: [new TextRun({ text: title, bold: true })],
      })
    );
  }

  for (const block of blocks) {
    if (block.type === "heading") {
      children.push(
        new Paragraph({
          heading: block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1,
          alignment,
          bidirectional: rtl,
          children: [new TextRun({ text: block.text, bold: true })],
        })
      );
    } else if (block.type === "paragraph") {
      children.push(
        new Paragraph({
          alignment,
          bidirectional: rtl,
          children: [new TextRun({ text: block.text, bold: !!block.bold })],
        })
      );
    } else if (block.type === "spacer") {
      children.push(new Paragraph({ text: "" }));
    } else if (block.type === "table") {
      const headerRow = new TableRow({
        children: (block.headers || []).map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ alignment, bidirectional: rtl, children: [new TextRun({ text: String(h), bold: true })] })],
            })
        ),
      });
      const dataRows = (block.rows || []).map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ alignment, bidirectional: rtl, children: [new TextRun({ text: String(cell) })] })],
                })
            ),
          })
      );
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows],
        })
      );
      children.push(new Paragraph({ text: "" }));
    }
  }

  return new Document({ sections: [{ children }] });
}

async function generateDocx({ filename, title, blocks, rtl = true }) {
  ensureOutDir();
  const doc = buildDoc({ title, blocks, rtl });
  const buffer = await Packer.toBuffer(doc);
  const safeName = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  const filePath = path.join(OUT_DIR, safeName);
  fs.writeFileSync(filePath, buffer);
  return { ok: true, file_path: filePath, filename: safeName };
}

module.exports = { generateDocx };
