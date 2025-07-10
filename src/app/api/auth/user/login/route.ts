import { NextRequest } from 'next/server'
import { UserService } from '@/lib/services/user.service'
import { generateToken } from '@/lib/auth'
import { userLoginSchema } from '@/lib/validations'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = userLoginSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { email, password } = validation.data

    // Buscar usuario por email
    const user = await UserService.findByEmail(email)
    if (!user) {
      return notFoundResponse('Usuario no encontrado')
    }

    // Validar credenciales
    const validUser = await UserService.validateCredentials(email, password)
    if (!validUser) {
      return unauthorizedResponse('Email o contraseña incorrectos')
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      type: 'user'
    })

    // Preparar respuesta (sin contraseña)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return successResponse({
      token,
      user: userResponse
    })

  } catch (error) {
    console.error('Error en login de usuario:', error)
    return internalErrorResponse('Error al iniciar sesión')
  }
}
