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
    console.log('📋 Getting REAL queue tickets for worker:', worker.id)

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

    // Obtener SOLO tickets en espera (waiting) de la cola - NO incluir saltados, cancelados, etc.
    const queueTickets = await TicketService.getWaitingTicketsInQueue(validatedQueueId)

    console.log('✅ Found', queueTickets.length, 'REAL waiting tickets in queue')
    console.log('📊 Queue tickets details:', queueTickets.map(t => ({ 
      number: t.number, 
      customer: t.customerName,
      status: t.status,
      priority: t.priority,
      position: t.position
    })))

    return successResponse({
      tickets: queueTickets.map(ticket => ({
        id: ticket.id,
        number: ticket.number,
        customerName: ticket.customerName,
        customerPhone: ticket.customerPhone,
        serviceType: ticket.serviceType,
        priority: ticket.priority,
        status: ticket.status,
        position: ticket.position,
        estimatedWaitTime: ticket.estimatedWaitTime,
        createdAt: ticket.createdAt.toISOString()
      })),
      queueInfo: {
        id: validatedQueueId,
        totalWaiting: queueTickets.length,
        totalCalled: 0, // Los tickets llamados no están en la cola de espera
        totalInProgress: 0 // Los tickets en progreso no están en la cola de espera
      }
    })

  } catch (error) {
    console.error('❌ Error getting REAL queue tickets:', error)
    return internalErrorResponse('Error al obtener tickets de la cola')
  }
})
