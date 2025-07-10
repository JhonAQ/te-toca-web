import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { callCustomerSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('📞 Call customer request from worker:', worker.id)

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = callCustomerSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber } = validation.data

    // Buscar el ticket
    const ticket = await TicketService.findByNumber(ticketNumber)
    if (!ticket) {
      return notFoundResponse('Ticket no encontrado')
    }

    // Verificar que el ticket está en estado válido para ser llamado
    if (ticket.status !== 'waiting') {
      return forbiddenResponse(`El ticket ${ticketNumber} no está en espera`)
    }

    // Llamar al cliente
    const calledTicket = await TicketService.callTicket(ticket.id, worker.id)
    if (!calledTicket) {
      return internalErrorResponse('Error al llamar al cliente')
    }

    console.log('✅ Customer called successfully:', ticketNumber)

    return successResponse({
      success: true,
      message: 'Cliente llamado exitosamente',
      ticket: {
        id: calledTicket.id,
        number: calledTicket.number,
        status: calledTicket.status,
        calledAt: calledTicket.calledAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error calling customer:', error)
    return internalErrorResponse('Error al llamar al cliente')
  }
})
