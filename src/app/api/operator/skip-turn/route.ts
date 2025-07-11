import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { skipTurnSchema } from '@/lib/validations/ticket.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('⏭️ Skipping turn for worker:', worker.id)

    const body = await request.json()
    const validation = skipTurnSchema.safeParse(body)
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber, reason } = validation.data

    console.log('🎫 Skipping ticket:', ticketNumber, 'reason:', reason)

    // Buscar el ticket por número
    const ticket = await TicketService.findByNumber(ticketNumber)
    if (!ticket) {
      console.log('❌ Ticket not found:', ticketNumber)
      return notFoundResponse('Ticket no encontrado')
    }

    // Verificar que el worker tiene acceso a esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, ticket.queueId)
    if (!hasAccess) {
      console.log('❌ Worker does not have access to ticket queue')
      return forbiddenResponse('No tienes acceso a esta cola')
    }

    // Verificar que el ticket está en un estado válido para saltar
    if (!['waiting', 'called'].includes(ticket.status)) {
      console.log('❌ Ticket cannot be skipped in current status:', ticket.status)
      return forbiddenResponse('Este ticket no se puede saltar en su estado actual')
    }

    // Saltar el ticket
    const skippedTicket = await TicketService.skipTicket(ticket.id, reason || 'Cliente no respondió')
    if (!skippedTicket) {
      return internalErrorResponse('Error al saltar el ticket')
    }

    // Obtener el siguiente ticket en la cola
    const nextTicket = await TicketService.getNextTicketInQueue(ticket.queueId, worker.id)

    console.log('✅ Ticket skipped successfully:', ticketNumber)

    return successResponse({
      skippedTicket: {
        id: skippedTicket.id,
        number: skippedTicket.number,
        customerName: skippedTicket.customerName,
        status: skippedTicket.status,
        reason: skippedTicket.reason,
        skippedAt: skippedTicket.skippedAt?.toISOString()
      },
      nextTicket: nextTicket ? {
        id: nextTicket.id,
        number: nextTicket.number,
        customerName: nextTicket.customerName,
        customerPhone: nextTicket.customerPhone,
        customerEmail: nextTicket.customerEmail,
        serviceType: nextTicket.serviceType,
        priority: nextTicket.priority,
        estimatedWaitTime: nextTicket.estimatedWaitTime
      } : null,
      message: `Ticket ${skippedTicket.number} saltado. Motivo: ${skippedTicket.reason}`
    })

  } catch (error) {
    console.error('❌ Error skipping turn:', error)
    return internalErrorResponse('Error al saltar el turno')
  }
})
