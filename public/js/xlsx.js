/* ==========================================================
   FILE : js/xlsx.js
   ISI  : Pembuat file Excel (.xlsx) sederhana, jalan di browser tanpa library & tanpa internet.
   PAKAI: downloadXlsx("nama-file.xlsx", { sheet, headers, rows, widths, types, totals })
          types  : tipe tiap kolom -> "t" teks, "c" rupiah, "m" teks rata tengah
          totals : nomor kolom (mulai 0) yang dijumlahkan di baris TOTAL paling bawah
   ========================================================== */

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
// ZIP tanpa kompresi (cukup untuk .xlsx)
function zipStore(files) {
  const enc = new TextEncoder(),
    u16 = (v) => [v & 255, (v >> 8) & 255],
    u32 = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255],
    parts = [],
    cd = [];
  let off = 0;
  for (const f of files) {
    const name = enc.encode(f.name),
      data = enc.encode(f.text),
      crc = crc32(data),
      sz = data.length,
      lh = [0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(sz), ...u32(sz), ...u16(name.length), ...u16(0)];
    parts.push(new Uint8Array(lh), name, data);
    cd.push({ name, crc, sz, off });
    off += lh.length + name.length + sz;
  }
  const cdStart = off;
  let cdSize = 0;
  for (const e of cd) {
    const h = [0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(e.crc), ...u32(e.sz), ...u32(e.sz), ...u16(e.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(e.off)];
    parts.push(new Uint8Array(h), e.name);
    cdSize += h.length + e.name.length;
  }
  parts.push(new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(cd.length), ...u16(cd.length), ...u32(cdSize), ...u32(cdStart), ...u16(0)]));
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let p = 0;
  for (const x of parts) {
    out.set(x, p);
    p += x.length;
  }
  return out;
}
const xe = (s) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
const colL = (i) => {
  let s = "";
  for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};
// Gaya sel: 0 default, 1 header, 2 teks, 3 rupiah, 4 label total, 5 total rupiah, 6 teks tengah
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;Rp&quot;\\ #,##0"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFA23336"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFBE6E3"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9B8B5"/></left><right style="thin"><color rgb="FFD9B8B5"/></right><top style="thin"><color rgb="FFD9B8B5"/></top><bottom style="thin"><color rgb="FFD9B8B5"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1" indent="1"/></xf><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center" indent="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf><xf numFmtId="164" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center" indent="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

function xlsxBytes({ sheet = "Sheet1", headers, rows, widths = [], types = [], totals = [] }) {
  const n = rows.length,
    last = colL(headers.length - 1),
    S = { t: 2, c: 3, m: 6 },
    str = (r, c, v, s) => `<c r="${colL(c)}${r}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${xe(v)}</t></is></c>`,
    num = (r, c, v, s) => `<c r="${colL(c)}${r}" s="${s}"><v>${+v || 0}</v></c>`;
  let sd = `<row r="1" ht="32" customHeight="1">${headers.map((h, c) => str(1, c, h, 1)).join("")}</row>`;
  rows.forEach((row, i) => {
    sd += `<row r="${i + 2}">${row.map((v, c) => ((types[c] || "t") == "c" ? num(i + 2, c, v, 3) : str(i + 2, c, v, S[types[c] || "t"]))).join("")}</row>`;
  });
  if (totals.length) {
    const r = n + 2;
    sd += `<row r="${r}" ht="24" customHeight="1">${headers
      .map((h, c) => {
        if (c == 0) return str(r, c, "TOTAL", 4);
        if (totals.includes(c)) {
          const sum = rows.reduce((a, x) => a + (+x[c] || 0), 0);
          return `<c r="${colL(c)}${r}" s="5"><f>SUM(${colL(c)}2:${colL(c)}${n + 1})</f><v>${sum}</v></c>`;
        }
        return `<c r="${colL(c)}${r}" s="4"/>`;
      })
      .join("")}</row>`;
  }
  const cols = headers.map((h, c) => `<col min="${c + 1}" max="${c + 1}" width="${widths[c] || 16}" customWidth="1"/>`).join(""),
    sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="20"/><cols>${cols}</cols><sheetData>${sd}</sheetData><autoFilter ref="A1:${last}${n + 1}"/><pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  return zipStore([
    { name: "[Content_Types].xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: "_rels/.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xe(sheet)}" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${xe(sheet)}'!$A$1:$${last}$${n + 1}</definedName></definedNames></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: "xl/styles.xml", text: STYLES },
    { name: "xl/worksheets/sheet1.xml", text: sheetXml },
  ]);
}
// Unduh sebagai file .xlsx
function downloadXlsx(name, spec) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([xlsxBytes(spec)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
  );
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
