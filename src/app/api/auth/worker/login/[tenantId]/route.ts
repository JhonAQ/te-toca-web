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
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    // Await params primero
    const resolvedParams = await params
    console.log('🔄 Login attempt for tenant:', resolvedParams.tenantId)

    // Validar parámetro de URL
    const paramValidation = tenantParamSchema.safeParse(resolvedParams)
    if (!paramValidation.success) {
      console.log('❌ Tenant ID validation failed:', paramValidation.error)
      return errorResponse('ID de tenant inválido', 400)
    }

    const { tenantId } = paramValidation.data
    console.log('✅ Tenant ID validated:', tenantId)

    // Verificar que el tenant existe
    const tenant = await TenantService.findById(tenantId)
    if (!tenant) {
      console.log('❌ Tenant not found:', tenantId)
      return notFoundResponse('Tenant no encontrado')
    }

    console.log('✅ Tenant found:', tenant.name)

    const body = await request.json()
    console.log('📋 Request body received:', { username: body.username, passwordLength: body.password?.length })
    
    // Validar datos de entrada
    const validation = workerLoginSchema.safeParse(body)
    if (!validation.success) {
      console.log('❌ Body validation failed:', validation.error)
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { username, password } = validation.data

    // Validar credenciales del worker
    const worker = await WorkerService.validateCredentials(tenantId, username, password)
    if (!worker) {
      console.log('❌ Worker credentials invalid')
      return unauthorizedResponse('Credenciales inválidas')
    }

    console.log('✅ Worker authenticated:', worker.name)

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

    console.log('✅ Login successful for worker:', worker.name)

    return successResponse({
      token,
      user: workerResponse
    })

  } catch (error) {
    console.error('❌ Error en autenticación de worker:', error)
    return internalErrorResponse('Error al iniciar sesión')
  }
}
