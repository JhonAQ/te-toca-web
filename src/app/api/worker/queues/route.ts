import { NextRequest } from 'next/server'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { 
  successResponse, 
  internalErrorResponse,
  notFoundResponse,
  forbiddenResponse
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('🔍 Fetching queues for authenticated worker:', worker.id, 'username:', worker.username, 'tenant:', worker.tenantId)

    // Verificar que el worker está activo
    const activeWorker = await WorkerService.findById(worker.id)
    if (!activeWorker || !activeWorker.isActive) {
      console.log('❌ Worker not found or inactive:', worker.id)
      return forbiddenResponse('Tu cuenta está inactiva. Contacta al administrador.')
    }

    // Obtener colas disponibles para el worker autenticado basado en sus permisos
    const queuesData = await WorkerService.getAvailableQueues(worker.id)
    
    if (!queuesData) {
      console.log('❌ Failed to retrieve queues for worker:', worker.id)
      return internalErrorResponse('Error al obtener las colas')
    }

    // Asegurar que queuesData sea un array
    const queues = Array.isArray(queuesData) ? queuesData : []

    console.log('🔐 Access control result - Worker', worker.username, 'has access to', queues.length, 'queues')

    // Si no tiene acceso a ninguna cola
    if (queues.length === 0) {
      console.log('⚠️ Worker has no queue access permissions:', worker.username)
      return successResponse({
        queues: [],
        stats: {
          totalQueues: 0,
          totalWaiting: 0,
          averageWaitTime: 0,
          activeOperators: 0
        },
        message: 'No tienes colas asignadas. Contacta a tu supervisor para obtener permisos.'
      })
    }

    // Calcular estadísticas solo de las colas a las que tiene acceso
    const stats = {
      totalQueues: queues.length,
      totalWaiting: queues.reduce((sum, queue) => sum + (queue.waitingCount || 0), 0),
      averageWaitTime: queues.length > 0 
        ? Math.round(queues.reduce((sum, queue) => sum + (queue.averageWaitTime || 0), 0) / queues.length)
        : 0,
      activeOperators: await WorkerService.getActiveOperatorsCount(worker.tenantId)
    }

    console.log('✅ Successfully fetched', queues.length, 'authorized queues with stats:', stats)

    // Formatear respuesta con información adicional de seguridad
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
      companyName: queue.companyName || '',
      // Metadata de acceso
      accessGranted: true,
      accessLevel: 'full', // Could be 'read', 'partial', 'full' based on permissions
      createdAt: queue.createdAt ? new Date(queue.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: queue.updatedAt ? new Date(queue.updatedAt).toISOString() : new Date().toISOString()
    }))

    return successResponse({
      queues: formattedQueues,
      stats,
      worker: {
        id: worker.id,
        username: worker.username,
        role: worker.role,
        tenantId: worker.tenantId
      },
      accessInfo: {
        totalQueuesInTenant: await getTotalQueuesInTenant(worker.tenantId),
        accessibleQueues: formattedQueues.length,
        accessPercentage: Math.round((formattedQueues.length / await getTotalQueuesInTenant(worker.tenantId)) * 100)
      }
    })

  } catch (error) {
    console.error('❌ Error al obtener colas para worker:', worker.id, error)
    return internalErrorResponse('Error al obtener las colas disponibles')
  }
})

// Helper function to get total queues in tenant
async function getTotalQueuesInTenant(tenantId: string): Promise<number> {
  try {
    const { db } = await import('@/lib/db')
    const count = await db.queue.count({
      where: { tenantId, isActive: true }
    })
    return count
  } catch (error) {
    console.error('Error counting total queues:', error)
    return 1 // Avoid division by zero
  }
}
