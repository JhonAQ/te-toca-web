import { NextRequest } from 'next/server'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { 
  successResponse, 
  internalErrorResponse,
  notFoundResponse
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    // Obtener colas disponibles para el worker
    const queues = await WorkerService.getAvailableQueues(worker.id)
    
    if (!queues) {
      return notFoundResponse('Worker no encontrado')
    }

    // Calcular estadísticas
    const stats = {
      totalQueues: queues.length,
      totalWaiting: queues.reduce((sum, queue) => sum + queue.waitingCount, 0),
      averageWaitTime: queues.length > 0 
        ? Math.round(queues.reduce((sum, queue) => sum + queue.averageWaitTime, 0) / queues.length)
        : 0,
      activeOperators: 5 // Este valor debería calcularse desde la base de datos
    }

    return successResponse({
      queues: queues.map(queue => ({
        id: queue.id,
        name: queue.name,
        description: queue.description,
        waitingCount: queue.waitingCount,
        averageWaitTime: queue.averageWaitTime,
        isActive: queue.isActive,
        priority: queue.priority,
        category: queue.category,
        tenantId: queue.tenantId,
        createdAt: queue.createdAt.toISOString(),
        updatedAt: queue.updatedAt.toISOString()
      })),
      stats
    })

  } catch (error) {
    console.error('Error al obtener colas:', error)
    return internalErrorResponse('Error al obtener las colas')
  }
})
