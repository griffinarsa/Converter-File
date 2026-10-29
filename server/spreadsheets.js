import ExcelJS from 'exceljs';
import YAML from 'yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(value => value !== '')) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  row.push(cell); if (row.some(value => value !== '')) rows.push(row);
  return rows;
}

function objectsFromRows(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((value, index) => String(value ?? `column_${index + 1}`));
  return rows.slice(1).map(row => Object.fromEntries(headers.map((key, i) => [key, row[i] ?? ''])));
}

function encodeDelimited(rows, delimiter) {
  return rows.map(row => row.map(value => {
    const text = String(value ?? '');
    return /["\r\n,\t]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(delimiter)).join('\r\n');
}

export async function convertSpreadsheet({ buffer, from, to, dir, safeName, office }) {
  let records;
  if (from === 'json') records = JSON.parse(buffer.toString('utf8'));
  else if (from === 'yaml' || from === 'yml') records = YAML.parse(buffer.toString('utf8'));
  else if (from === 'xml') {
    const parsed = new XMLParser().parse(buffer.toString('utf8'));
    const root = parsed.rows ?? Object.values(parsed)[0] ?? parsed;
    records = root.row ?? root.record ?? Object.values(root).find(Array.isArray) ?? root;
  } else if (from === 'csv' || from === 'tsv') {
    records = objectsFromRows(parseDelimited(buffer.toString('utf8'), from === 'tsv' ? '\t' : ','));
  } else {
    let workbookBuffer = buffer;
    if (from === 'xls') {
      const input = path.join(dir, 'source.xls');
      await writeFile(input, buffer);
      workbookBuffer = await office(input, dir, 'xlsx');
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(workbookBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('Workbook tidak memiliki sheet.');
    const rows = [];
    sheet.eachRow({ includeEmpty: false }, row => rows.push(row.values.slice(1).map(value => value?.text ?? value?.result ?? value ?? '')));
    records = objectsFromRows(rows);
  }
  if (!Array.isArray(records)) records = records && typeof records === 'object' ? [records] : [{ value: records ?? '' }];
  const keys = [...new Set(records.flatMap(record => record && typeof record === 'object' ? Object.keys(record) : ['value']))];
  const rows = [keys, ...records.map(record => keys.map(key => record && typeof record === 'object' ? record[key] ?? '' : record))];

  if (to === 'pdf') {
    const escape = value => String(value ?? '').replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]);
    const html = `<html><meta charset="utf-8"><body><table border="1"><thead><tr>${keys.map(key => `<th>${escape(key)}</th>`).join('')}</tr></thead><tbody>${records.map(record => `<tr>${keys.map(key => `<td>${escape(record?.[key])}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    const htmlPath = path.join(dir, 'table.html');
    await writeFile(htmlPath, html);
    return { buffer: await office(htmlPath, dir, 'pdf'), mime: 'application/pdf' };
  }

  if (to === 'json') return { buffer: Buffer.from(JSON.stringify(records, null, 2)), mime: 'application/json' };
  if (to === 'yaml' || to === 'yml') return { buffer: Buffer.from(YAML.stringify(records)), mime: 'text/yaml' };
  if (to === 'xml') return { buffer: Buffer.from(new XMLBuilder({ format: true }).build({ rows: { row: records } })), mime: 'application/xml' };
  if (to === 'csv' || to === 'tsv') return { buffer: Buffer.from(encodeDelimited(rows, to === 'tsv' ? '\t' : ',')), mime: 'text/csv' };
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  sheet.addRows(rows);
  return { buffer: Buffer.from(await workbook.xlsx.writeBuffer()), mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
}
