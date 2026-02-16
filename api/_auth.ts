import crypto from 'crypto'
import { parse, serialize } from 'cookie'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

// Log DeprecationWarnings with stack traces to help identify the originating module
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('warning', (warning: Error) => {
    if (warning && warning.name === 'DeprecationWarning') {
      // Keep a concise, readable log in Vercel logs
      console.warn('DeprecationWarning captured:', warning.message)
      if (warning.stack) console.warn(warning.stack)
    }
  })
}

const SESSION_COOKIE = 'intern_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8
const RESET_TOKEN_TTL_MINUTES = 15

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

const hashResetToken = (token: string) =>
  crypto.createHmac('sha256', getSecret()).update(token).digest('hex')

const ensureAuthTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_auth (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      reset_token_hash TEXT,
      reset_token_expires_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

type AuthRow = {
  password_hash: string
}

const getEnvPasswordHash = () => {
  const hash = process.env.ADMIN_PASSWORD_HASH
  return hash?.trim() || null
}

const ensureAdminAuthRow = async () => {
  await ensureAuthTable()
  const { rows } = await sql<AuthRow>`
    SELECT password_hash
    FROM admin_auth
    WHERE id = 1
    LIMIT 1
  `

  if (rows[0]?.password_hash) return rows[0].password_hash

  const envHash = getEnvPasswordHash()
  if (!envHash) {
    throw new Error('ADMIN_PASSWORD_HASH is not set and no DB admin password exists')
  }

  await sql`
    INSERT INTO admin_auth (id, password_hash)
    VALUES (1, ${envHash})
    ON CONFLICT (id) DO NOTHING
  `
  return envHash
}

export const getAdminPasswordHash = async () => {
  const hash = await ensureAdminAuthRow()
  return hash
}

export const updateAdminPasswordHash = async (passwordHash: string) => {
  await ensureAdminAuthRow()
  await sql`
    UPDATE admin_auth
    SET password_hash = ${passwordHash},
        reset_token_hash = NULL,
        reset_token_expires_at = NULL,
        updated_at = NOW()
    WHERE id = 1
  `
}

export const createPasswordResetToken = async () => {
  await ensureAdminAuthRow()
  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = hashResetToken(token)

  await sql`
    UPDATE admin_auth
    SET reset_token_hash = ${tokenHash},
        reset_token_expires_at = NOW() + (${`${RESET_TOKEN_TTL_MINUTES} minutes`}::interval),
        updated_at = NOW()
    WHERE id = 1
  `

  return token
}

export const consumePasswordResetToken = async (token: string) => {
  if (!token?.trim()) return false
  await ensureAdminAuthRow()
  const tokenHash = hashResetToken(token.trim())
  const { rows } = await sql`
    UPDATE admin_auth
    SET reset_token_hash = NULL,
        reset_token_expires_at = NULL,
        updated_at = NOW()
    WHERE id = 1
      AND reset_token_hash = ${tokenHash}
      AND reset_token_expires_at IS NOT NULL
      AND reset_token_expires_at > NOW()
    RETURNING id
  `
  return rows.length > 0
}

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
