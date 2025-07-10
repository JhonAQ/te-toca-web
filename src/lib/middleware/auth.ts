import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, UserPayload } from '@/lib/auth'
import { unauthorizedResponse } from '@/lib/utils/response'

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

export function withWorkerAuth(
  handler: (request: NextRequest, worker: UserPayload & { type: 'worker' }, ...args: any[]) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: UserPayload, ...args: any[]) => {
    if (user.type !== 'worker') {
      return unauthorizedResponse('Acceso restringido a operarios')
    }
    return handler(request, user as UserPayload & { type: 'worker' }, ...args)
  })
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
