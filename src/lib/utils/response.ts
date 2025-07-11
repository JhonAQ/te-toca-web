import { NextResponse } from 'next/server'

export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data
    },
    { status }
  )
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status }
  )
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      message: 'Datos de entrada inválidos',
      errors
    },
    { status: 400 }
  )
}

export function unauthorizedResponse(message: string = 'No autorizado') {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status: 401 }
  )
}

export function forbiddenResponse(message: string = 'Acceso prohibido') {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status: 403 }
  )
}

export function notFoundResponse(message: string = 'Recurso no encontrado') {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status: 404 }
  )
}

export function conflictResponse(message: string) {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status: 409 }
  )
}

export function internalErrorResponse(message: string = 'Error interno del servidor') {
  return NextResponse.json(
    {
      success: false,
      message
    },
    { status: 500 }
  )
}
