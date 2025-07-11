import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { cancelTicketSchema } from '@/lib/validations/ticket.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('❌ Cancelling ticket for worker:', worker.id)

    const body = await request.json()
    const validation = cancelTicketSchema.safeParse(body)
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber, reason } = validation.data

    console.log('🎫 Cancelling ticket:', ticketNumber, 'reason:', reason)

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

    // Verificar que el ticket no está ya completado o cancelado
    if (['completed', 'cancelled'].includes(ticket.status)) {
      console.log('❌ Ticket cannot be cancelled in current status:', ticket.status)
      return forbiddenResponse('Este ticket ya está finalizado')
    }

    // Cancelar el ticket
    const cancelledTicket = await TicketService.cancelTicket(ticket.id, reason)
    if (!cancelledTicket) {
      return internalErrorResponse('Error al cancelar el ticket')
    }

    // Obtener el siguiente ticket en la cola
    const nextTicket = await TicketService.getNextTicketInQueue(ticket.queueId, worker.id)

    console.log('✅ Ticket cancelled successfully:', ticketNumber)

    return successResponse({
      cancelledTicket: {
        id: cancelledTicket.id,
        number: cancelledTicket.number,
        customerName: cancelledTicket.customerName,
        status: cancelledTicket.status,
        reason: cancelledTicket.reason,
        cancelledAt: cancelledTicket.cancelledAt?.toISOString()
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
      message: `Ticket ${cancelledTicket.number} cancelado. Motivo: ${cancelledTicket.reason}`
    })

  } catch (error) {
    console.error('❌ Error cancelling ticket:', error)
    return internalErrorResponse('Error al cancelar el ticket')
  }
})
