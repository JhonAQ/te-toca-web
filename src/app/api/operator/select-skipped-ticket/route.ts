import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { selectSkippedTicketSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('🔄 Select skipped ticket request from worker:', worker.id)

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = selectSkippedTicketSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber } = validation.data

    // Buscar el ticket saltado
    const ticket = await TicketService.findByNumber(ticketNumber)
    if (!ticket) {
      return notFoundResponse('Ticket no encontrado')
    }

    // Verificar que el ticket está saltado
    if (ticket.status !== 'skipped') {
      return forbiddenResponse(`El ticket ${ticketNumber} no está saltado`)
    }

    // Reanudar el ticket saltado
    const resumedTicket = await TicketService.resumeSkippedTicket(ticket.id)
    if (!resumedTicket) {
      return internalErrorResponse('Error al retomar el ticket saltado')
    }

    console.log('✅ Skipped ticket selected successfully:', ticketNumber)

    return successResponse({
      success: true,
      message: 'Ticket saltado seleccionado exitosamente',
      ticket: {
        id: resumedTicket.id,
        number: resumedTicket.number,
        customerName: resumedTicket.customerName,
        status: resumedTicket.status,
        resumedAt: resumedTicket.resumedAt?.toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error selecting skipped ticket:', error)
    return internalErrorResponse('Error al seleccionar el ticket saltado')
  }
})
