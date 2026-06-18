import * as XLSX from 'xlsx'
import { dataUrlToArrayBuffer } from './parseMaterialImport'

export function rowsToTableData(rows) {
  if (!rows?.length) return []
  return rows.map((row) => (Array.isArray(row) ? row : [row]))
}

export function parseSpreadsheetBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
}

export async function loadSpreadsheetRows(file, url) {
  if (file?.dataUrl) {
    return parseSpreadsheetBuffer(dataUrlToArrayBuffer(file.dataUrl))
  }
  if (url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('无法加载表格文件')
    return parseSpreadsheetBuffer(await res.arrayBuffer())
  }
  return []
}
