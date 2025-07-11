import { NextRequest, NextResponse } from 'next/server'
import { requireWorkerAuth, requireUserAuth, WorkerPayload, ClientPayload } from '@/lib/auth'
import { errorResponse, unauthorizedResponse } from '@/lib/utils/response'

// Middleware para rutas que requieren autenticación de worker
export function withWorkerAuth(
  handler: (request: NextRequest, worker: WorkerPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const worker = requireWorkerAuth(request)
      return await handler(request, worker)
    } catch (error) {
      console.error('❌ Worker auth failed:', error)
      if (error instanceof Error) {
        return unauthorizedResponse(error.message)
      }
      return unauthorizedResponse('Autenticación requerida')
    }
  }
}

// Middleware para rutas que requieren autenticación de usuario
export function withUserAuth(
  handler: (request: NextRequest, user: ClientPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = requireUserAuth(request)
      return await handler(request, user)
    } catch (error) {
      console.error('❌ User auth failed:', error)
      if (error instanceof Error) {
        return unauthorizedResponse(error.message)
      }
      return unauthorizedResponse('Autenticación requerida')
    }
  }
}
