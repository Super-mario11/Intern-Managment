import { sql } from '@vercel/postgres'
import { seedInterns } from './_seed.js'

export type DbIntern = {
  id: string
  name: string
  role: string
  email: string
  phone: string | null
  projects: string[]
  manager: string | null
  start_date: string | null
  performance: string | null
  skills: string[]
  department: string | null
}

export type Intern = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  projects: string[]
  manager: string
  startDate: string
  performance: string
  skills: string[]
  department: string
}

export const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS interns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      projects TEXT[] NOT NULL DEFAULT '{}',
      manager TEXT,
      start_date DATE,
      performance TEXT,
      skills TEXT[] NOT NULL DEFAULT '{}',
      department TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export const toIntern = (row: DbIntern): Intern => ({
  id: row.id,
  name: row.name,
  role: row.role,
  email: row.email,
  phone: row.phone ?? '',
  projects: row.projects ?? [],
  manager: row.manager ?? '',
  startDate: row.start_date ? new Date(row.start_date).toISOString().slice(0, 10) : '',
  performance: row.performance ?? '',
  skills: row.skills ?? [],
  department: row.department ?? '',
})

export const getNextId = async () => {
  const result = await sql`SELECT id FROM interns WHERE id LIKE 'INT-%' ORDER BY id DESC LIMIT 1`
  const last = result.rows[0]?.id as string | undefined
  if (!last) return 'INT-001'
  const match = last.match(/INT-(\d+)/)
  const next = match ? Number(match[1]) + 1 : 1
  return `INT-${String(next).padStart(3, '0')}`
}

export const seedIfEmpty = async () => {
  const existing = await sql`SELECT COUNT(*)::int AS count FROM interns`
  if (existing.rows[0]?.count) return
  for (const intern of seedInterns) {
    await sql`
      INSERT INTO interns (
        id, name, role, email, phone, projects, manager, start_date, performance, skills, department
      ) VALUES (
        ${intern.id},
        ${intern.name},
        ${intern.role},
        ${intern.email},
        ${intern.phone},
        ${sql.array(intern.projects, 'text')},
        ${intern.manager},
        ${intern.startDate || null},
        ${intern.performance},
        ${sql.array(intern.skills, 'text')},
        ${intern.department}
      )
    `
  }
}

export const resetSeed = async () => {
  await sql`DELETE FROM interns`
  await seedIfEmpty()
}
