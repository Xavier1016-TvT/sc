let counter = 0

export function generateId(prefix = 'id') {
  counter += 1
  return `${prefix}_${Date.now()}_${counter}`
}
