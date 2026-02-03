import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureTable, getNextId, seedIfEmpty, toIntern } from '../_db'
import { requireAdminSession } from '../_auth'
import { sql } from '@vercel/postgres'

type InternPayload = {
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
  await ensureTable()

  if (req.method === 'GET') {
    await seedIfEmpty()
    const result = await sql`SELECT * FROM interns ORDER BY id ASC`
    res.status(200).json({ ok: true, interns: result.rows.map(toIntern) })
    return
  }

  const session = requireAdminSession(req, res)
  if (!session) return

  if (req.method === 'POST') {
    const {
      name,
      role,
      email,
      phone,
      projects,
      manager,
      startDate,
      performance,
      skills,
      department,
    } = (req.body || {}) as InternPayload

    if (!name || !role || !email) {
      res.status(400).json({ ok: false, error: 'Missing required fields' })
      return
    }

    const id = await getNextId()
    const result = await sql`
      INSERT INTO interns (
        id, name, role, email, phone, projects, manager, start_date, performance, skills, department
      ) VALUES (
        ${id},
        ${name},
        ${role},
        ${email},
        ${phone ?? ''},
        ${projects ?? []},
        ${manager ?? ''},
        ${startDate || null},
        ${performance ?? ''},
        ${skills ?? []},
        ${department ?? ''}
      )
      RETURNING *
    `
    res.status(201).json({ ok: true, intern: toIntern(result.rows[0]) })
    return
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' })
}
