import { NextRequest } from 'next/server'
import { requireUserAuth } from '@/lib/auth'
import { 
  successResponse, 
  unauthorizedResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del usuario
    const user = requireUserAuth(request)
    
    // En una implementación real, aquí podrías:
    // - Invalidar el token en una blacklist
    // - Limpiar tokens de push notifications
    // - Registrar el logout en logs de auditoría
    
    // Por ahora, simplemente confirmamos el logout
    return successResponse({
      message: 'Sesión cerrada exitosamente'
    })

  } catch (error) {
    console.error('Error en logout:', error)
    if (error instanceof Error && error.message === 'Token de autorización requerido') {
      return unauthorizedResponse(error.message)
    }
    return internalErrorResponse('Error al cerrar sesión')
  }
}
