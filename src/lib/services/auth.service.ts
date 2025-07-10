import { generateToken, hashPassword, verifyPassword } from '@/lib/auth'
import { UserService } from './user.service'
import { WorkerService } from './worker.service'
import { TenantService } from './tenant.service'

export class AuthService {
  // Registro de usuario cliente
  static async registerUser(data: {
    name: string
    email: string
    phone?: string
    password: string
  }) {
    // Verificar si el email ya existe
    const existingUser = await UserService.findByEmail(data.email)
    if (existingUser) {
      throw new Error('Ya existe una cuenta con este email')
    }

    // Crear el usuario
    const user = await UserService.create(data)

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      type: 'user'
    })

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    }
  }

  // Login de usuario cliente
  static async loginUser(email: string, password: string) {
    // Buscar usuario
    const user = await UserService.findByEmail(email)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Validar credenciales
    const isValid = await UserService.validateCredentials(email, password)
    if (!isValid) {
      throw new Error('Email o contraseña incorrectos')
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      type: 'user'
    })

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    }
  }

  // Login de worker/operario
  static async loginWorker(tenantId: string, username: string, password: string) {
    // Verificar que el tenant existe
    const tenant = await TenantService.findById(tenantId)
    if (!tenant) {
      throw new Error('Tenant no encontrado')
    }

    // Validar credenciales del worker
    const worker = await WorkerService.validateCredentials(tenantId, username, password)
    if (!worker) {
      throw new Error('Credenciales inválidas')
    }

    // Generar token
    const token = generateToken({
      id: worker.id,
      username: worker.username,
      type: 'worker',
      tenantId: worker.tenantId,
      role: worker.role
    })

    return {
      token,
      user: {
        id: worker.id,
        name: worker.name,
        username: worker.username,
        role: worker.role,
        tenantId: worker.tenantId,
        tenantName: tenant.name,
        permissions: worker.permissions as string[],
        isActive: worker.isActive
      }
    }
  }

  // Logout (invalidar token - implementación futura)
  static async logout(token: string) {
    // En una implementación completa, aquí podrías:
    // - Agregar el token a una blacklist en Redis
    // - Registrar el logout en logs de auditoría
    // - Limpiar sesiones relacionadas
    
    return { message: 'Sesión cerrada exitosamente' }
  }
}
