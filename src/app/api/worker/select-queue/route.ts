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
    console.log('🔄 Queue selection request from worker:', worker.id)

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

    // Verificar que la cola existe
    const queue = await QueueService.findById(queueId)
    if (!queue) {
      console.log('❌ Queue not found:', queueId)
      return notFoundResponse('Cola no encontrada')
    }

    console.log('🔍 Found queue:', queue.name, 'for tenant:', queue.tenantId)

    // Verificar que la cola pertenece al tenant del worker
    if (queue.tenantId !== worker.tenantId) {
      console.log('❌ Access denied. Queue tenant:', queue.tenantId, 'Worker tenant:', worker.tenantId)
      return forbiddenResponse('No tienes permisos para acceder a esta cola')
    }

    // Verificar que la cola está activa
    if (!queue.isActive) {
      console.log('❌ Queue is inactive:', queueId)
      return forbiddenResponse('La cola seleccionada no está disponible')
    }

    // Seleccionar la cola para el worker
    const success = await WorkerService.selectQueue(worker.id, queueId)
    if (!success) {
      console.log('❌ Failed to select queue for worker:', worker.id)
      return forbiddenResponse('No se pudo seleccionar la cola. Inténtalo de nuevo.')
    }

    console.log('✅ Queue selected successfully:', queue.name, 'for worker:', worker.username)

    return successResponse({
      success: true,
      message: 'Cola seleccionada exitosamente',
      queue: {
        id: queue.id,
        name: queue.name,
        description: queue.description || ''
      },
      worker: {
        id: worker.id,
        username: worker.username,
        currentQueueId: queueId
      }
    })

  } catch (error) {
    console.error('❌ Error al seleccionar cola:', error)
    return internalErrorResponse('Error interno al seleccionar la cola')
  }
})
