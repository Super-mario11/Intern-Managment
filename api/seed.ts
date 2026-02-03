import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureTable, resetSeed } from './_db.js'
import { requireAdminSession } from './_auth.js'

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

    await resetSeed()
    res.status(200).json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({ ok: false, error: message })
  }
}
