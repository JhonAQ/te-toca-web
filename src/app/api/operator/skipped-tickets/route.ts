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
    console.log('📋 Getting REAL skipped tickets for worker:', worker.id)

    const { searchParams } = new URL(request.url)
    const queueId = searchParams.get('queueId')

    console.log('🔍 Request params - queueId:', queueId)

    // Validar parámetros
    const validation = queueStatusQuerySchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      console.log('❌ Validation failed:', errors)
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    console.log('✅ Validated queueId:', validatedQueueId)

    // Verificar que el worker tiene acceso a esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, validatedQueueId)
    if (!hasAccess) {
      console.log('❌ Worker does not have access to queue:', validatedQueueId)
      return forbiddenResponse('No tienes acceso a esta cola')
    }

    console.log('🔐 Access validated for queue:', validatedQueueId)

    // Obtener tickets saltados de la cola REALES
    const skippedTickets = await TicketService.getSkippedTickets(validatedQueueId)

    console.log('✅ Found', skippedTickets.length, 'REAL skipped tickets')
    console.log('📊 Skipped tickets details:', skippedTickets.map(t => ({ 
      id: t.id, 
      number: t.number, 
      customer: t.customerName,
      reason: t.reason 
    })))

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
    console.error('❌ Error getting REAL skipped tickets:', error)
    return internalErrorResponse('Error al obtener tickets saltados')
  }
})
