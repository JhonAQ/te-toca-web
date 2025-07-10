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
    console.log('📊 Getting queue details for worker:', worker.id)

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

    // Obtener estadísticas y tickets de la cola
    const [queueStats, upcomingTickets] = await Promise.all([
      QueueService.getQueueStats(validatedQueueId),
      TicketService.getUpcomingTickets(validatedQueueId, 10)
    ])

    console.log('✅ Queue details retrieved for queue:', queue.name)

    return successResponse({
      queue: {
        id: queue.id,
        name: queue.name,
        description: queue.description,
        isActive: queue.isActive,
        waitingCount: queueStats.waitingCount,
        averageWaitTime: queueStats.averageWaitTime
      },
      tickets: upcomingTickets.map(ticket => ({
        id: ticket.number, // Using number as id for simplicity
        number: ticket.number,
        customerName: ticket.customerName,
        serviceType: ticket.serviceType,
        estimatedTime: ticket.estimatedTime,
        priority: ticket.priority,
        status: 'waiting', // All upcoming tickets are waiting
        createdAt: new Date().toISOString() // Mock creation time
      }))
    })

  } catch (error) {
    console.error('❌ Error getting queue details:', error)
    return internalErrorResponse('Error al obtener los detalles de la cola')
  }
})
