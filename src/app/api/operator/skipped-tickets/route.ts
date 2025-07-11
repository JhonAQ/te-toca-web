import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { queueStatusQuerySchema } from '@/lib/validations/queue.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('📋 Getting skipped tickets for worker:', worker.id)

    const { searchParams } = new URL(request.url)
    const queueId = searchParams.get('queueId')

    // Validar parámetros
    const validation = queueStatusQuerySchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    // Verificar que el worker tiene acceso a esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, validatedQueueId)
    if (!hasAccess) {
      console.log('❌ Worker does not have access to queue:', validatedQueueId)
      return forbiddenResponse('No tienes acceso a esta cola')
    }

    // Obtener tickets saltados de la cola
    const skippedTickets = await TicketService.getSkippedTickets(validatedQueueId)

    console.log('✅ Found', skippedTickets.length, 'skipped tickets')

    return successResponse({
      skippedTickets: skippedTickets.map(ticket => ({
        id: ticket.id,
        number: ticket.number,
        customerName: ticket.customerName,
        customerPhone: ticket.customerPhone,
        waitTime: ticket.waitTime,
        reason: ticket.reason,
        priority: ticket.priority,
        skippedAt: ticket.skippedAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('❌ Error getting skipped tickets:', error)
    return internalErrorResponse('Error al obtener tickets saltados')
  }
})
