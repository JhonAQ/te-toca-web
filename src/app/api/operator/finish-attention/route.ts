import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { finishAttentionSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('✅ Finish attention request from worker:', worker.id)

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = finishAttentionSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber, notes, serviceRating } = validation.data

    // Buscar el ticket
    const ticket = await TicketService.findByNumber(ticketNumber)
    if (!ticket) {
      return notFoundResponse('Ticket no encontrado')
    }

    // Verificar que el ticket está siendo atendido por este worker
    if (ticket.workerId !== worker.id) {
      return forbiddenResponse('No estás atendiendo este ticket')
    }

    // Verificar estado del ticket
    if (!['called', 'in_progress'].includes(ticket.status)) {
      return forbiddenResponse(`El ticket ${ticketNumber} no está en atención`)
    }

    // Completar el ticket
    const completedTicket = await TicketService.completeTicket(ticket.id, notes, serviceRating)
    if (!completedTicket) {
      return internalErrorResponse('Error al completar la atención')
    }

    console.log('✅ Attention finished successfully:', ticketNumber)

    return successResponse({
      success: true,
      message: 'Atención terminada exitosamente',
      ticket: {
        id: completedTicket.id,
        number: completedTicket.number,
        status: completedTicket.status,
        completedAt: completedTicket.completedAt?.toISOString(),
        serviceTime: completedTicket.serviceTime || 0
      }
    })

  } catch (error) {
    console.error('❌ Error finishing attention:', error)
    return internalErrorResponse('Error al terminar la atención')
  }
})
