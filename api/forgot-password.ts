import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createPasswordResetToken } from './_auth.js'

const GENERIC_MESSAGE =
  'If the recovery details are valid, a reset token has been issued.'
const RESEND_API_URL = 'https://api.resend.com/emails'

const sendResetTokenEmail = async (to: string, token: string) => {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()
  if (!apiKey || !from) return false

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Admin password reset token',
      text: `Your password reset token is: ${token}\nThis token expires in 15 minutes.`,
      html: `<p>Your password reset token is:</p><p><strong>${token}</strong></p><p>This token expires in 15 minutes.</p>`,
    }),
  })

  return response.ok
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')

  const expectedEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim().toLowerCase()
  if (!expectedEmail) {
    res.status(500).json({ ok: false, error: 'ADMIN_RECOVERY_EMAIL is not configured' })
    return
  }

  const token = await createPasswordResetToken()
  const sent = await sendResetTokenEmail(expectedEmail, token).catch(
    () => false
  )
  if (!sent && process.env.NODE_ENV === 'production') {
    res.status(500).json({ ok: false, error: 'Failed to send reset email' })
    return
  }

  const payload: { ok: true; message: string; resetToken?: string } = {
    ok: true,
    message: GENERIC_MESSAGE,
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.resetToken = token
  }

  res.status(200).json(payload)
}
