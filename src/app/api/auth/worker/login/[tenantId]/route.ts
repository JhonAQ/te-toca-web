import { NextRequest } from 'next/server'
import { WorkerService } from '@/lib/services/worker.service'
import { TenantService } from '@/lib/services/tenant.service'
import { generateToken } from '@/lib/auth'
import { workerLoginSchema, tenantParamSchema } from '@/lib/validations'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'
import { parseWorkerPermissions } from '@/lib/utils/json-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    // Validar parámetro de URL
    const paramValidation = tenantParamSchema.safeParse(params)
    if (!paramValidation.success) {
      return errorResponse('ID de tenant inválido', 400)
    }

    const { tenantId } = paramValidation.data

    // Verificar que el tenant existe
    const tenant = await TenantService.findById(tenantId)
    if (!tenant) {
      return notFoundResponse('Tenant no encontrado')
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = workerLoginSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { username, password } = validation.data

    // Validar credenciales del worker
    const worker = await WorkerService.validateCredentials(tenantId, username, password)
    if (!worker) {
      return unauthorizedResponse('Credenciales inválidas')
    }

    // Generar token JWT
    const token = generateToken({
      id: worker.id,
      username: worker.username,
      type: 'worker',
      tenantId: worker.tenantId,
      role: worker.role
    })

    // Preparar respuesta (sin contraseña)
    const workerResponse = {
      id: worker.id,
      name: worker.name,
      username: worker.username,
      role: worker.role,
      tenantId: worker.tenantId,
      tenantName: tenant.name,
      permissions: parseWorkerPermissions(worker.permissions),
      isActive: worker.isActive
    }

    return successResponse({
      token,
      user: workerResponse
    })

  } catch (error) {
    console.error('Error en autenticación de worker:', error)
    return internalErrorResponse('Error al iniciar sesión')
  }
}
