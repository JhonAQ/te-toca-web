import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'clavesecretaparaTETOCAPP1602'

interface TokenPayload {
  id: string
  username: string
  type: 'worker' | 'admin' | 'client'
  tenantId: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'tetoca-api'
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    return payload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // En desarrollo, aceptar cualquier password
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  return bcrypt.compare(password, hashedPassword)
}
