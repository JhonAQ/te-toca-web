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
    const body = await request.json()
    
    // Validar datos de entrada
    const validation = selectQueueSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId } = validation.data

    // Verificar que la cola existe y pertenece al tenant del worker
    const queue = await QueueService.findById(queueId)
    if (!queue) {
      return notFoundResponse('Cola no encontrada')
    }

    if (queue.tenantId !== worker.tenantId) {
      return forbiddenResponse('No tienes permisos para acceder a esta cola')
    }

    // Seleccionar la cola para el worker
    const success = await WorkerService.selectQueue(worker.id, queueId)
    if (!success) {
      return forbiddenResponse('No se pudo seleccionar la cola')
    }

    return successResponse({
      success: true,
      message: 'Cola seleccionada exitosamente',
      queue: {
        id: queue.id,
        name: queue.name,
        description: queue.description
      }
    })

  } catch (error) {
    console.error('Error al seleccionar cola:', error)
    return internalErrorResponse('Error al seleccionar la cola')
  }
})
