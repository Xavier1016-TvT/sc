import * as XLSX from 'xlsx'
import { createMaterialItem } from './defaults'
import { MATERIAL_TYPES } from './constants'
import {
  dataUrlToText,
  parseCsv,
  isCsvFile,
  isSpreadsheetFile,
  isImageFile,
} from './fileHelpers'

const COLUMN_RULES = [
  { field: 'code', keys: ['编码', '物料编码', 'code', '料号'] },
  { field: 'name', keys: ['物料名称', '名称', 'name', '品名'] },
  { field: 'spec', keys: ['规格', '规格型号', 'spec', '型号'] },
  { field: 'required', keys: ['需求量', '需求数量', 'required', '需求数'] },
  { field: 'received', keys: ['实到数', '实到数量', 'received', '到货数'] },
  { field: 'shortage', keys: ['缺料数', '缺料', 'shortage'] },
  { field: 'status', keys: ['物料状态', '状态', 'status'] },
  { field: 'note', keys: ['备注', 'note', 'remark', '说明'] },
  { field: 'type', keys: ['物料类型', '类型', 'type'] },
]

function normalizeCell(value) {
  return String(value ?? '')
    .trim()
    .replace(/\uFEFF/g, '')
}

function normalizeHeader(value) {
  return normalizeCell(value).replace(/\s/g, '').toLowerCase()
}

export function dataUrlToArrayBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  if (!base64) throw new Error('文件数据无效')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function readRowsFromFile(file) {
  if (isCsvFile(file)) {
    return parseCsv(dataUrlToText(file.dataUrl))
  }
  if (isSpreadsheetFile(file)) {
    const workbook = XLSX.read(dataUrlToArrayBuffer(file.dataUrl), { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!sheet) return []
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  }
  return null
}

function buildColumnMap(headers) {
  const map = {}
  headers.forEach((header, index) => {
    const h = normalizeHeader(header)
    if (!h) return
    for (const rule of COLUMN_RULES) {
      if (map[rule.field] !== undefined) continue
      if (rule.keys.some((key) => h === normalizeHeader(key) || h.includes(normalizeHeader(key)))) {
        map[rule.field] = index
      }
    }
  })
  return map
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 15); i += 1) {
    const headers = (rows[i] || []).map(normalizeHeader)
    const hit = headers.filter((h) =>
      COLUMN_RULES.some((rule) => rule.keys.some((key) => h.includes(normalizeHeader(key))))
    ).length
    if (hit >= 2) return i
  }
  return 0
}

function toNumber(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function normalizeType(value) {
  const text = normalizeCell(value)
  if (MATERIAL_TYPES.includes(text)) return text
  if (/pcb/i.test(text)) return 'PCB'
  if (/贴片/.test(text)) return '贴片'
  if (/配件/.test(text)) return '配件'
  return '贴片'
}

function rowToItem(row, colMap) {
  const get = (field) => {
    const idx = colMap[field]
    return idx === undefined ? '' : row[idx]
  }

  const code = normalizeCell(get('code'))
  const name = normalizeCell(get('name'))
  const spec = normalizeCell(get('spec'))
  if (!code && !name && !spec) return null

  const required = toNumber(get('required'))
  const received = toNumber(get('received'))
  let shortage = toNumber(get('shortage'))
  if (!shortage && (required || received)) {
    shortage = Math.max(0, required - received)
  }

  return {
    ...createMaterialItem(),
    code,
    name,
    spec,
    required,
    received,
    shortage,
    status: normalizeCell(get('status')),
    note: normalizeCell(get('note')),
    type: normalizeType(get('type')),
  }
}

export function parseMaterialFileToItems(file) {
  if (!file?.dataUrl) return { items: [], kind: 'empty' }
  if (isImageFile(file)) return { items: [], kind: 'image' }

  const rows = readRowsFromFile(file)
  if (rows === null) {
    throw new Error('暂不支持该文件格式自动解析，请使用 CSV 或 Excel（.xlsx/.xls）')
  }
  if (!rows.length) return { items: [], kind: 'table' }

  const headerIdx = findHeaderRowIndex(rows)
  const headers = rows[headerIdx] || []
  const colMap = buildColumnMap(headers)

  if (colMap.code === undefined && colMap.name === undefined) {
    throw new Error('未识别到表头，请确保包含：编码、物料名称 等列名')
  }

  const items = []
  for (let i = headerIdx + 1; i < rows.length; i += 1) {
    const row = rows[i] || []
    const item = rowToItem(row, colMap)
    if (item) items.push(item)
  }

  return { items, kind: 'table' }
}
