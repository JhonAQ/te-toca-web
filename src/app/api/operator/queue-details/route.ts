import { NextRequest } from 'next/server'
import { QueueService } from '@/lib/services/queue.service'
import { WorkerService } from '@/lib/services/worker.service'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { queueStatusQuerySchema } from '@/lib/validations/queue.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('📊 Getting REAL queue details for worker:', worker.id)

    const { searchParams } = new URL(request.url)
    const queueId = searchParams.get('queueId')

    // Validar parámetros
    const validation = queueStatusQuerySchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    console.log('🔍 Fetching REAL details for queue:', validatedQueueId)

    // Verificar que el worker tiene acceso a esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, validatedQueueId)
    if (!hasAccess) {
      console.log('❌ Worker does not have access to queue:', validatedQueueId)
      return forbiddenResponse('No tienes acceso a esta cola')
    }

    // Obtener los detalles REALES de la cola
    const queue = await QueueService.findById(validatedQueueId)
    if (!queue || queue.tenantId !== worker.tenantId) {
      console.log('❌ Queue not found or belongs to different tenant')
      return notFoundResponse('Cola no encontrada')
    }

    // Obtener estadísticas REALES y tickets de la cola
    const [queueStats, upcomingTickets] = await Promise.all([
      QueueService.getQueueStats(validatedQueueId),
      TicketService.getUpcomingTickets(validatedQueueId, 10)
    ])

    console.log('✅ REAL Queue details retrieved:', {
      name: queue.name,
      waiting: queueStats.waitingCount,
      avgTime: queueStats.averageWaitTime,
      upcoming: upcomingTickets.length
    })

    return successResponse({
      queue: {
        id: queue.id,
        name: queue.name,
        description: queue.description || '',
        isActive: queue.isActive,
        waitingCount: queueStats.waitingCount,
        averageWaitTime: queueStats.averageWaitTime,
        totalProcessedToday: queueStats.totalProcessedToday,
        currentOperators: queueStats.currentOperators
      },
      tickets: upcomingTickets.map(ticket => ({
        number: ticket.number,
        customerName: ticket.customerName,
        serviceType: ticket.serviceType || 'General',
        estimatedTime: ticket.estimatedTime,
        priority: ticket.priority,
        status: 'waiting'
      }))
    })

  } catch (error) {
    console.error('❌ Error getting REAL queue details:', error)
    return internalErrorResponse('Error al obtener los detalles de la cola')
  }
})
