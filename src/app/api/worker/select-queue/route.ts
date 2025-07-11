import { NextRequest } from 'next/server'
import { WorkerService } from '@/lib/services/worker.service'
import { QueueService } from '@/lib/services/queue.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { selectQueueSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('🔄 Queue selection request from authenticated worker:', worker.id, 'username:', worker.username)

    const body = await request.json()
    console.log('📋 Request body:', body)
    
    // Validar datos de entrada
    const validation = selectQueueSchema.safeParse(body)
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten().fieldErrors)
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId } = validation.data
    console.log('✅ Validated queue selection for queueId:', queueId)

    // VERIFICACIÓN CRÍTICA: Validar que el worker tiene permisos para esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, queueId)
    if (!hasAccess) {
      console.log('❌ ACCESS DENIED - Worker does not have permission for queue:', queueId)
      return forbiddenResponse('No tienes permisos para acceder a esta cola')
    }

    console.log('🔐 ACCESS GRANTED - Worker has permission for queue:', queueId)

    // Verificar que la cola existe y está activa
    const queue = await QueueService.findById(queueId)
    if (!queue) {
      console.log('❌ Queue not found:', queueId)
      return notFoundResponse('Cola no encontrada')
    }

    // Verificar que la cola pertenece al tenant del worker
    if (queue.tenantId !== worker.tenantId) {
      console.log('❌ SECURITY VIOLATION - Queue tenant mismatch. Queue tenant:', queue.tenantId, 'Worker tenant:', worker.tenantId)
      return forbiddenResponse('Acceso denegado por seguridad')
    }

    // Verificar que la cola está activa
    if (!queue.isActive) {
      console.log('❌ Queue is inactive:', queueId)
      return forbiddenResponse('La cola seleccionada no está disponible')
    }

    console.log('🔍 Queue validation passed:', queue.name, 'for tenant:', queue.tenantId)

    // Seleccionar la cola para el worker
    const success = await WorkerService.selectQueue(worker.id, queueId)
    if (!success) {
      console.log('❌ Failed to select queue for worker:', worker.id)
      return forbiddenResponse('No se pudo seleccionar la cola. Verifica tus permisos.')
    }

    console.log('✅ Queue selected successfully:', queue.name, 'for worker:', worker.username)

    return successResponse({
      success: true,
      message: `Cola "${queue.name}" seleccionada exitosamente`,
      queue: {
        id: queue.id,
        name: queue.name,
        description: queue.description || '',
        tenantId: queue.tenantId,
        isActive: queue.isActive
      },
      worker: {
        id: worker.id,
        username: worker.username,
        role: worker.role,
        currentQueueId: queueId,
        tenantId: worker.tenantId
      },
      accessInfo: {
        permissionLevel: 'full',
        grantedAt: new Date().toISOString(),
        validUntil: null // Could implement time-based access
      }
    })

  } catch (error) {
    console.error('❌ Error al seleccionar cola para worker:', worker.id, error)
    return internalErrorResponse('Error interno al seleccionar la cola')
  }
})
