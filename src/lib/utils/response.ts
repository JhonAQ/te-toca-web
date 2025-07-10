import { NextResponse } from 'next/server'

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function validationErrorResponse(errors: Record<string, string[]>, status: number = 400) {
  return NextResponse.json(
    {
      error: 'Datos de entrada inválidos',
      errors,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function unauthorizedResponse(message: string = 'No autorizado') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message: string = 'Acceso denegado') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message: string = 'Recurso no encontrado') {
  return errorResponse(message, 404)
}

export function conflictResponse(message: string = 'Conflicto de recursos') {
  return errorResponse(message, 409)
}

export function internalErrorResponse(message: string = 'Error interno del servidor') {
  return errorResponse(message, 500)
}
