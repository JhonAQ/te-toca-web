import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { skipTurnSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('⏭️ Skip turn request from worker:', worker.id)

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = skipTurnSchema.safeParse(body)
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
    if (!['waiting', 'called'].includes(ticket.status)) {
      return forbiddenResponse(`El ticket ${ticketNumber} no puede ser saltado`)
    }

    // Saltar el ticket
    const skippedTicket = await TicketService.skipTicket(ticket.id, reason)
    if (!skippedTicket) {
      return internalErrorResponse('Error al saltar el turno')
    }

    console.log('✅ Turn skipped successfully:', ticketNumber)

    return successResponse({
      success: true,
      message: 'Turno saltado exitosamente',
      ticket: {
        id: skippedTicket.id,
        number: skippedTicket.number,
        status: skippedTicket.status,
        skippedAt: skippedTicket.skippedAt?.toISOString(),
        reason: skippedTicket.reason
      }
    })

  } catch (error) {
    console.error('❌ Error skipping turn:', error)
    return internalErrorResponse('Error al saltar el turno')
  }
})
