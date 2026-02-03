import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie } from './_auth'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  clearSessionCookie(res)
  res.status(200).json({ ok: true })
}
