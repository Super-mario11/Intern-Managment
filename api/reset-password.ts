import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import {
  consumePasswordResetToken,
  updateAdminPasswordHash,
} from './_auth.js'

const MIN_PASSWORD_LENGTH = 8

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  const { token, newPassword } = (req.body || {}) as {
    token?: string
    newPassword?: string
  }

  if (!token?.trim()) {
    res.status(400).json({ ok: false, error: 'Reset token is required' })
    return
  }
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    })
    return
  }

  const validToken = await consumePasswordResetToken(token)
  if (!validToken) {
    res.status(400).json({ ok: false, error: 'Invalid or expired reset token' })
    return
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await updateAdminPasswordHash(hash)
  res.status(200).json({ ok: true })
}
