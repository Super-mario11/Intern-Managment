import type { Intern } from '../types'

export const initials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const normalizeList = (value: string) =>
  value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)

export const parseListCell = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return []
  if (trimmed.includes('|')) {
    return trimmed.split('|').map(v => v.trim()).filter(Boolean)
  }
  if (trimmed.includes(';')) {
    return trimmed.split(';').map(v => v.trim()).filter(Boolean)
  }
  return normalizeList(trimmed)
}

export const generateId = (interns: Intern[]) => {
  const max = interns.reduce((acc, intern) => {
    const match = intern.id.match(/INT-(\d+)/)
    if (!match) return acc
    const num = Number(match[1])
    return Number.isNaN(num) ? acc : Math.max(acc, num)
  }, 0)
  const next = String(max + 1).padStart(3, '0')
  return `INT-${next}`
}

export const parseCSV = (text: string) => {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && next === '"') {
      current += '"'
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if (char === '\n' && !inQuotes) {
      row.push(current)
      rows.push(row)
      row = []
      current = ''
      continue
    }

    if (char === '\r') continue

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    rows.push(row)
  }

  return rows
}

const escapeCSV = (value: string) => {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export const toCSV = (interns: Intern[]) => {
  const header = [
    'id',
    'name',
    'role',
    'email',
    'phone',
    'projects',
    'manager',
    'startDate',
    'performance',
    'skills',
    'department',
  ]
  const lines = [header.join(',')]
  interns.forEach(intern => {
    const row = [
      intern.id,
      intern.name,
      intern.role,
      intern.email,
      intern.phone,
      intern.projects.join(' | '),
      intern.manager,
      intern.startDate,
      intern.performance,
      intern.skills.join(' | '),
      intern.department,
    ].map(cell => escapeCSV(cell ?? ''))
    lines.push(row.join(','))
  })
  return lines.join('\n')
}
