import crypto from 'crypto'
import { parse, serialize } from 'cookie'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const SESSION_COOKIE = 'intern_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

const getSecret = () => {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET is not set')
  }
  return secret
}

const base64UrlEncode = (value: string) =>
  Buffer.from(value).toString('base64url')

const base64UrlDecode = (value: string) =>
  Buffer.from(value, 'base64url').toString('utf-8')

const sign = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64url')

export const createSessionToken = () => {
  const secret = getSecret()
  const payload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const encoded = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(encoded, secret)
  return `${encoded}.${signature}`
}

export const verifySessionToken = (token?: string) => {
  if (!token) return null
  const secret = getSecret()
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null
  const expected = sign(encoded, secret)
  if (signature.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }
  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as {
      sub: string
      exp: number
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export const getSessionFromRequest = (req: VercelRequest) => {
  const cookies = parse(req.headers.cookie || '')
  return verifySessionToken(cookies[SESSION_COOKIE])
}

export const requireAdminSession = (
  req: VercelRequest,
  res: VercelResponse
) => {
  const session = getSessionFromRequest(req)
  if (!session) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return null
  }
  return session
}

export const setSessionCookie = (res: VercelResponse, token: string) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    })
  )
}

export const clearSessionCookie = (res: VercelResponse) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })
  )
}
