import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSessionFromRequest } from './_auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  const session = getSessionFromRequest(req)
  res.status(200).json({ ok: true, authed: Boolean(session) })
}
