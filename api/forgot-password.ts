import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createPasswordResetToken } from './_auth.js'

const GENERIC_MESSAGE =
  'If the recovery details are valid, a reset token has been issued.'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  const { email } = (req.body || {}) as { email?: string }
  const expectedEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim().toLowerCase()
  const providedEmail = email?.trim().toLowerCase()

  if (expectedEmail && providedEmail !== expectedEmail) {
    res.status(200).json({ ok: true, message: GENERIC_MESSAGE })
    return
  }

  const token = await createPasswordResetToken()
  const payload: { ok: true; message: string; resetToken?: string } = {
    ok: true,
    message: GENERIC_MESSAGE,
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.resetToken = token
  }

  res.status(200).json(payload)
}
