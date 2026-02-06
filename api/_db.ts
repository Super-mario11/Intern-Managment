import { sql } from '@vercel/postgres'
import { seedInterns } from './_seed.js'

export type DbIntern = {
  id: string
  name: string
  role: string
  email: string
  phone: string | null
  image_url: string | null
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
  imageUrl: string
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
      image_url TEXT,
      projects TEXT[] NOT NULL DEFAULT '{}',
      manager TEXT,
      start_date DATE,
      performance TEXT,
      skills TEXT[] NOT NULL DEFAULT '{}',
      department TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE interns ADD COLUMN IF NOT EXISTS image_url TEXT`

  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'interns'
          AND column_name = 'id'
          AND data_type = 'uuid'
      ) THEN
        ALTER TABLE interns ALTER COLUMN id TYPE TEXT USING id::text;
      END IF;

      ALTER TABLE interns ALTER COLUMN id DROP DEFAULT;
    EXCEPTION
      WHEN undefined_column THEN
        NULL;
    END $$;
  `

}

export const toIntern = (row: DbIntern): Intern => ({
  id: row.id,
  name: row.name,
  role: row.role,
  email: row.email,
  phone: row.phone ?? '',
  imageUrl: row.image_url ?? '',
  projects: row.projects ?? [],
  manager: row.manager ?? '',
  startDate: row.start_date
    ? new Date(row.start_date).toISOString().slice(0, 10)
    : '',
  performance: row.performance ?? '',
  skills: row.skills ?? [],
  department: row.department ?? '',
})

const escapeArrayItem = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

export const toTextArrayLiteral = (value?: string[]) => {
  const items = (value ?? []).map(item => `"${escapeArrayItem(item)}"`)
  return `{${items.join(',')}}`
}

export const seedIfEmpty = async () => {
  const existing = await sql`SELECT COUNT(*)::int AS count FROM interns`
  if (existing.rows[0]?.count) return
  for (const intern of seedInterns) {
    await sql`
      INSERT INTO interns (
        id, name, role, email, phone, image_url, projects, manager, start_date, performance, skills, department
      ) VALUES (
        ${intern.id},
        ${intern.name},
        ${intern.role},
        ${intern.email},
        ${intern.phone},
        ${intern.imageUrl || null},
        ${toTextArrayLiteral(intern.projects)}::text[],
        ${intern.manager},
        ${intern.startDate || null},
        ${intern.performance},
        ${toTextArrayLiteral(intern.skills)}::text[],
        ${intern.department}
      )
    `
  }
}

export const resetSeed = async () => {
  await sql`DELETE FROM interns`
  await seedIfEmpty()
}

export const formatInternId = (value: number) =>
  `ID${String(value).padStart(2, '0')}`

export const getMaxInternIdNumber = async () => {
  const { rows } = await sql`
    SELECT id
    FROM interns
    WHERE id ~ '^ID\\d+$'
    ORDER BY CAST(SUBSTRING(id, 3) AS INT) DESC
    LIMIT 1
  `
  const current = rows[0]?.id as string | undefined
  if (!current) return 0
  const parsed = Number(current.slice(2))
  return Number.isNaN(parsed) ? 0 : parsed
}
