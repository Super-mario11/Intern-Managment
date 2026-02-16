import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  createSessionToken,
  getAdminPasswordHash,
  setSessionCookie,
} from './_auth.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  const { password } = (req.body || {}) as { password?: string }
  if (!password) {
    res.status(400).json({ ok: false, error: 'Password required' })
    return
  }

  const hash = await getAdminPasswordHash()
  const match = await bcrypt.compare(password, hash)
  if (!match) {
    res.status(401).json({ ok: false, error: 'Invalid credentials' })
    return
  }

  const token = createSessionToken()
  setSessionCookie(res, token)
  res.status(200).json({ ok: true })
}
