import { NextRequest } from 'next/server'
import { QueueService } from '@/lib/services/queue.service'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { queueStatusQuerySchema } from '@/lib/validations/queue.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('📊 Getting queue status for worker:', worker.id)

    const { searchParams } = new URL(request.url)
    const queueId = searchParams.get('queueId')

    // Validar parámetros
    const validation = queueStatusQuerySchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    // Verificar que la cola existe y pertenece al tenant del worker
    const queue = await QueueService.findById(validatedQueueId)
    if (!queue || queue.tenantId !== worker.tenantId) {
      return notFoundResponse('Cola no encontrada')
    }

    // Obtener estadísticas de la cola
    const [queueStats, upcomingTickets] = await Promise.all([
      QueueService.getQueueStats(validatedQueueId),
      TicketService.getUpcomingTickets(validatedQueueId, 5)
    ])

    console.log('✅ Queue status retrieved for queue:', queue.name)

    return successResponse({
      waitingCount: queueStats.waitingCount,
      averageWaitTime: queueStats.averageWaitTime,
      totalProcessedToday: queueStats.totalProcessedToday,
      queueStatus: queue.isActive ? 'active' : 'paused',
      upcomingTickets: upcomingTickets.map(ticket => ({
        number: ticket.number,
        customerName: ticket.customerName,
        estimatedTime: ticket.estimatedTime,
        priority: ticket.priority
      }))
    })

  } catch (error) {
    console.error('❌ Error getting queue status:', error)
    return internalErrorResponse('Error al obtener el estado de la cola')
  }
})
