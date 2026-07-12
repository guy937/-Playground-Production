const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const OUT_DIR = path.join(__dirname, "..", "..", "data", "generated");

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

// sheets: [{ name, headers: [...], rows: [[...], ...], rtl? }]
async function generateXlsx({ filename, sheets }) {
  ensureOutDir();
  const workbook = new ExcelJS.Workbook();

  for (const sheetDef of sheets) {
    const sheet = workbook.addWorksheet(sheetDef.name || "Sheet1", {
      views: [{ rightToLeft: sheetDef.rtl !== false }],
    });
    if (sheetDef.headers && sheetDef.headers.length) {
      const headerRow = sheet.addRow(sheetDef.headers);
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0EEE6" } };
      });
    }
    for (const row of sheetDef.rows || []) {
      sheet.addRow(row);
    }
    // Auto-width columns based on content length (rough heuristic, good
    // enough so a shared sheet isn't unreadable by default).
    sheet.columns.forEach((col) => {
      let maxLen = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 2, 40);
    });
  }

  const safeName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  const filePath = path.join(OUT_DIR, safeName);
  await workbook.xlsx.writeFile(filePath);
  return { ok: true, file_path: filePath, filename: safeName };
}

module.exports = { generateXlsx };
