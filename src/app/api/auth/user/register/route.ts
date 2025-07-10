import { NextRequest } from 'next/server'
import { UserService } from '@/lib/services/user.service'
import { generateToken } from '@/lib/auth'
import { userRegisterSchema } from '@/lib/validations'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  conflictResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = userRegisterSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { name, email, phone, password } = validation.data

    // Verificar si el email ya existe
    const existingUser = await UserService.findByEmail(email)
    if (existingUser) {
      return conflictResponse('Ya existe una cuenta con este email')
    }

    // Crear el usuario
    const user = await UserService.create({
      name,
      email,
      phone,
      password
    })

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
    }, 201)

  } catch (error) {
    console.error('Error en registro de usuario:', error)
    return internalErrorResponse('Error al crear la cuenta')
  }
}
