import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { requireAdminSession } from '../_auth.js'
import { ensureTable, seedIfEmpty, toIntern } from '../_db.js'
import type { DbIntern } from '../_db.js'

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

    if (req.method === 'GET') {
      await seedIfEmpty()
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const offset = (page - 1) * limit

      const { rows: interns } = await sql`
        SELECT * FROM interns
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
      const { rows: countResult } =
        await sql`SELECT COUNT(*)::int AS total FROM interns`
      const totalInterns = countResult[0]?.total || 0
      const totalPages = Math.ceil(totalInterns / limit)

      res.status(200).json({
        ok: true,
        interns: interns.map(row => toIntern(row as DbIntern)),
        totalPages,
        currentPage: page,
      })
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

      const result = await sql`
        INSERT INTO interns (
          name, role, email, phone, projects, manager, start_date, performance, skills, department
        ) VALUES (
          ${name},
          ${role},
          ${email},
          ${phone ?? ''},
          ${projects ?? []}::text[],
          ${manager ?? ''},
          ${startDate || null},
          ${performance ?? ''},
          ${skills ?? []}::text[],
          ${department ?? ''}
        )
        RETURNING *
      `
      res.status(201).json({
        ok: true,
        intern: toIntern(result.rows[0] as DbIntern),
      })
      return
    }

    res.status(405).json({ ok: false, error: 'Method not allowed' })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({ ok: false, error: message })
  }
}
