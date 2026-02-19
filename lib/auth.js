import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'ganpat_fallback_secret'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function getTokenFromRequest(req) {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export async function requireAuth(req, res) {
  const token = getTokenFromRequest(req)
  if (!token) {
    res.status(401).json({ message: 'Not authenticated' })
    return null
  }
  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ message: 'Invalid or expired token' })
    return null
  }
  return decoded
}
