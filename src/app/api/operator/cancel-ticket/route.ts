import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { cancelTicketSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('❌ Cancel ticket request from worker:', worker.id)

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = cancelTicketSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber, reason } = validation.data

    // Buscar el ticket
    const ticket = await TicketService.findByNumber(ticketNumber)
    if (!ticket) {
      return notFoundResponse('Ticket no encontrado')
    }

    // Verificar estado del ticket
    if (['completed', 'cancelled'].includes(ticket.status)) {
      return forbiddenResponse(`El ticket ${ticketNumber} ya está ${ticket.status}`)
    }

    // Cancelar el ticket
    const cancelledTicket = await TicketService.cancelTicket(ticket.id, reason)
    if (!cancelledTicket) {
      return internalErrorResponse('Error al cancelar el ticket')
    }

    console.log('✅ Ticket cancelled successfully:', ticketNumber)

    return successResponse({
      success: true,
      message: 'Ticket cancelado exitosamente',
      ticket: {
        id: cancelledTicket.id,
        number: cancelledTicket.number,
        status: cancelledTicket.status,
        cancelledAt: cancelledTicket.cancelledAt?.toISOString(),
        reason: cancelledTicket.reason
      }
    })

  } catch (error) {
    console.error('❌ Error cancelling ticket:', error)
    return internalErrorResponse('Error al cancelar el ticket')
  }
})
