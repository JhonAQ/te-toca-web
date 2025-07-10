import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { unauthorizedResponse } from '@/lib/utils/response'

interface AuthenticatedWorker {
  id: string
  username: string
  tenantId: string
  role: string
}

interface UserPayload {
  id: string
  username: string
  type: 'worker' | 'admin' | 'client'
  tenantId: string
  role: string
}

type AuthenticatedHandler = (
  request: NextRequest,
  worker: AuthenticatedWorker
) => Promise<Response>

export function withWorkerAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return unauthorizedResponse('Token de autorización requerido')
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)

      if (!payload || payload.type !== 'worker') {
        return unauthorizedResponse('Token inválido')
      }

      const worker: AuthenticatedWorker = {
        id: payload.id,
        username: payload.username,
        tenantId: payload.tenantId,
        role: payload.role
      }

      return handler(request, worker)
    } catch (error) {
      console.error('Error en autenticación:', error)
      return unauthorizedResponse('Error de autenticación')
    }
  }
}

export function withAuth(
  handler: (request: NextRequest, user: UserPayload, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const authHeader = request.headers.get('Authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return unauthorizedResponse('Token de autorización requerido')
      }

      const token = authHeader.substring(7)
      const user = verifyToken(token)
      
      if (!user) {
        return unauthorizedResponse('Token inválido o expirado')
      }

      return handler(request, user, ...args)
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      return unauthorizedResponse('Error de autenticación')
    }
  }
}

export function withUserAuth(
  handler: (request: NextRequest, user: UserPayload & { type: 'user' }, ...args: any[]) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: UserPayload, ...args: any[]) => {
    if (user.type !== 'user') {
      return unauthorizedResponse('Acceso restringido a clientes')
    }
    return handler(request, user as UserPayload & { type: 'user' }, ...args)
  })
}
