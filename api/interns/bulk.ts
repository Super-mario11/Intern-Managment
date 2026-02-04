import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureTable, toIntern } from '../_db.js'
import type { DbIntern } from '../_db.js'
import { requireAdminSession } from '../_auth.js'
import { sql } from '@vercel/postgres'

type IncomingIntern = {
  id?: string
  name?: string
  role?: string
  email?: string
  phone?: string
  projects?: string[]
  manager?: string
  startDate?: string
  performance?: string
  skills?: string[]
  department?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    await ensureTable()
    const session = requireAdminSession(req, res)
    if (!session) return

    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' })
      return
    }

    const { interns } = (req.body || {}) as { interns?: IncomingIntern[] }
    if (!Array.isArray(interns) || interns.length === 0) {
      res.status(400).json({ ok: false, error: 'No interns provided' })
      return
    }

    const saved = []
    for (const intern of interns) {
      const result = await sql`
        INSERT INTO interns (
          ${intern.id ? sql`id,` : sql``}
          name, role, email, phone, projects, manager, start_date, performance, skills, department
        ) VALUES (
          ${intern.id ? sql`${intern.id},` : sql``}
          ${intern.name ?? ''},
          ${intern.role ?? ''},
          ${intern.email ?? ''},
          ${intern.phone ?? ''},
          ${sql.array(intern.projects ?? [])},
          ${intern.manager ?? ''},
          ${intern.startDate || null},
          ${intern.performance ?? ''},
          ${sql.array(intern.skills ?? [])},
          ${intern.department ?? ''}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          projects = EXCLUDED.projects,
          manager = EXCLUDED.manager,
          start_date = EXCLUDED.start_date,
          performance = EXCLUDED.performance,
          skills = EXCLUDED.skills,
          department = EXCLUDED.department
        RETURNING *
      `
      saved.push(toIntern(result.rows[0] as DbIntern))
    }

    res.status(200).json({ ok: true, interns: saved })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({ ok: false, error: message })
  }
}
