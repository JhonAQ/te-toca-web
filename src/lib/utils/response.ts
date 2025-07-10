import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      error: message,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      error: 'Datos inválidos. Por favor revisa la información',
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString()
    },
    { status: 422 }
  )
}

export function unauthorizedResponse(message = 'Token de autorización requerido') {
  return errorResponse(message, 401, 'UNAUTHORIZED')
}

export function forbiddenResponse(message = 'No tienes permisos para realizar esta acción') {
  return errorResponse(message, 403, 'FORBIDDEN')
}

export function notFoundResponse(message = 'Recurso no encontrado') {
  return errorResponse(message, 404, 'NOT_FOUND')
}

export function conflictResponse(message = 'El recurso ya existe') {
  return errorResponse(message, 409, 'CONFLICT')
}

export function internalErrorResponse(message = 'Error interno del servidor') {
  return errorResponse(message, 500, 'INTERNAL_ERROR')
}
