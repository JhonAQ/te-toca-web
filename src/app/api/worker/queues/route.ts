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
    console.log('🔍 Fetching queues for worker:', worker.id, 'in tenant:', worker.tenantId)

    // Obtener colas disponibles para el worker
    const queuesData = await WorkerService.getAvailableQueues(worker.id)
    
    if (!queuesData) {
      console.log('❌ No queues found for worker:', worker.id)
      return notFoundResponse('No se encontraron colas para este operario')
    }

    // Asegurar que queuesData sea un array
    const queues = Array.isArray(queuesData) ? queuesData : []

    // Calcular estadísticas
    const stats = {
      totalQueues: queues.length,
      totalWaiting: queues.reduce((sum, queue) => sum + (queue.waitingCount || 0), 0),
      averageWaitTime: queues.length > 0 
        ? Math.round(queues.reduce((sum, queue) => sum + (queue.averageWaitTime || 0), 0) / queues.length)
        : 0,
      activeOperators: await WorkerService.getActiveOperatorsCount(worker.tenantId)
    }

    console.log('✅ Successfully fetched', queues.length, 'queues with stats:', stats)

    // Formatear respuesta
    const formattedQueues = queues.map(queue => ({
      id: queue.id,
      name: queue.name,
      description: queue.description || '',
      waitingCount: queue.waitingCount || 0,
      averageWaitTime: queue.averageWaitTime || 0,
      isActive: queue.isActive ?? true,
      priority: queue.priority || 'medium',
      category: queue.category || 'General',
      tenantId: queue.tenantId,
      createdAt: queue.createdAt ? new Date(queue.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: queue.updatedAt ? new Date(queue.updatedAt).toISOString() : new Date().toISOString()
    }))

    return successResponse({
      queues: formattedQueues,
      stats
    })

  } catch (error) {
    console.error('❌ Error al obtener colas:', error)
    return internalErrorResponse('Error al obtener las colas disponibles')
  }
})
