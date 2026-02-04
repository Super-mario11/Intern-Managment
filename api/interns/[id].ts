import { ensureTable, toIntern } from '../_db.js'
import type { DbIntern } from '../_db.js'
import { requireAdminSession } from '../_auth.js'
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
  try {
    await ensureTable()
    const { id } = req.query
    const internId = Array.isArray(id) ? id[0] : id

    if (!internId) {
      res.status(400).json({ ok: false, error: 'Missing intern id' })
      return
    }

    const session = requireAdminSession(req, res)
    if (!session) return

    if (req.method === 'PUT') {
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

      const result = await sql`
        UPDATE interns SET
          name = ${name},
          role = ${role},
          email = ${email},
          phone = ${phone ?? ''},
        projects = ${sql.array(projects ?? [])},
          manager = ${manager ?? ''},
          start_date = ${startDate || null},
          performance = ${performance ?? ''},
        skills = ${sql.array(skills ?? [])},
          department = ${department ?? ''}
        WHERE id = ${internId}
        RETURNING *
      `
      if (!result.rows.length) {
        res.status(404).json({ ok: false, error: 'Not found' })
        return
      }
      res
        .status(200)
        .json({ ok: true, intern: toIntern(result.rows[0] as DbIntern) })
      return
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM interns WHERE id = ${internId}`
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({ ok: false, error: message })
  }
}
