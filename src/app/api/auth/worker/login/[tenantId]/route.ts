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
    const resolvedParams = await params
    console.log('🔄 Worker login attempt for tenant:', resolvedParams.tenantId)

    // Validar parámetro de URL
    const paramValidation = tenantParamSchema.safeParse(resolvedParams)
    if (!paramValidation.success) {
      console.log('❌ Invalid tenant ID format')
      return errorResponse('ID de tenant inválido', 400)
    }

    const { tenantId } = paramValidation.data

    // Verificar que el tenant existe y está activo
    const tenant = await TenantService.findById(tenantId)
    if (!tenant) {
      console.log('❌ Tenant not found or inactive:', tenantId)
      return notFoundResponse('El sistema no está disponible')
    }

    if (!tenant.isActive) {
      console.log('❌ Tenant is inactive:', tenantId)
      return unauthorizedResponse('El sistema está temporalmente deshabilitado')
    }

    console.log('✅ Tenant validated:', tenant.name)

    // Obtener y validar datos del request
    const body = await request.json()
    console.log('📋 Login attempt for username:', body.username)
    
    const validation = workerLoginSchema.safeParse(body)
    if (!validation.success) {
      console.log('❌ Request validation failed')
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { username, password } = validation.data

    // Validar credenciales del worker REALES
    const worker = await WorkerService.validateCredentials(tenantId, username, password)
    if (!worker) {
      console.log('❌ Invalid credentials for username:', username)
      return unauthorizedResponse('Usuario o contraseña incorrectos')
    }

    // Verificar que el worker está activo
    if (!worker.isActive) {
      console.log('❌ Worker account is inactive:', username)
      return unauthorizedResponse('Tu cuenta está desactivada. Contacta al administrador.')
    }

    console.log('✅ Worker authenticated successfully:', worker.name)

    // Generar token JWT
    const token = generateToken({
      id: worker.id,
      username: worker.username,
      type: 'worker',
      tenantId: worker.tenantId,
      role: worker.role
    })

    // Preparar respuesta completa
    const workerResponse = {
      id: worker.id,
      name: worker.name,
      username: worker.username,
      role: worker.role,
      tenantId: worker.tenantId,
      tenantName: tenant.name,
      permissions: parseWorkerPermissions(worker.permissions),
      isActive: worker.isActive,
      currentQueueId: worker.currentQueueId || null
    }

    console.log('✅ Login successful for worker:', worker.name, 'in tenant:', tenant.name)

    return successResponse({
      token,
      user: workerResponse,
      message: `Bienvenido ${worker.name}`
    })

  } catch (error) {
    console.error('❌ Error during worker authentication:', error)
    
    // Log detallado del error para debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    
    return internalErrorResponse('Error interno del servidor. Intenta nuevamente.')
  }
}
