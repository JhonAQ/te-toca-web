import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'clavesecretaparaTETOCAPP1602'

export interface UserPayload {
  id: string
  email?: string
  username?: string
  type: 'user' | 'worker'
  tenantId?: string
}

export interface WorkerPayload extends UserPayload {
  type: 'worker'
  tenantId: string
  role: string
}

export interface ClientPayload extends UserPayload {
  type: 'user'
  email: string
}

// Generar token JWT
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verificar token JWT
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    return null
  }
}

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Extraer token del header Authorization
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Obtener usuario autenticado desde request
export function getAuthenticatedUser(request: NextRequest): UserPayload | null {
  const token = extractTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

// Middleware para verificar autenticación
export function requireAuth(request: NextRequest): UserPayload {
  const user = getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Token de autorización requerido')
  }
  return user
}

// Middleware para verificar que sea worker
export function requireWorkerAuth(request: NextRequest): WorkerPayload {
  const user = requireAuth(request)
  if (user.type !== 'worker') {
    throw new Error('Acceso restringido a operarios')
  }
  return user as WorkerPayload
}

// Middleware para verificar que sea cliente
export function requireUserAuth(request: NextRequest): ClientPayload {
  const user = requireAuth(request)
  if (user.type !== 'user') {
    throw new Error('Acceso restringido a clientes')
  }
  return user as ClientPayload
}
