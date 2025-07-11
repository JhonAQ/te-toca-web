import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { selectSkippedTicketSchema } from '@/lib/validations/ticket.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('🔄 Selecting skipped ticket for worker:', worker.id)

    const body = await request.json()
    const validation = selectSkippedTicketSchema.safeParse(body)
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber } = validation.data

    console.log('🎫 Selecting skipped ticket:', ticketNumber)

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

    // Verificar que el ticket está saltado
    if (ticket.status !== 'skipped') {
      console.log('❌ Ticket is not skipped:', ticket.status)
      return forbiddenResponse('Este ticket no está saltado')
    }

    // Reanudar el ticket saltado
    const resumedTicket = await TicketService.resumeSkippedTicket(ticket.id)
    if (!resumedTicket) {
      return internalErrorResponse('Error al retomar el ticket')
    }

    console.log('✅ Skipped ticket selected successfully:', ticketNumber)

    return successResponse({
      ticket: {
        id: resumedTicket.id,
        number: resumedTicket.number,
        customerName: resumedTicket.customerName,
        customerPhone: resumedTicket.customerPhone,
        customerEmail: resumedTicket.customerEmail,
        serviceType: resumedTicket.serviceType,
        priority: resumedTicket.priority,
        status: resumedTicket.status,
        resumedAt: resumedTicket.resumedAt?.toISOString()
      },
      message: `Ticket ${resumedTicket.number} retomado exitosamente`
    })

  } catch (error) {
    console.error('❌ Error selecting skipped ticket:', error)
    return internalErrorResponse('Error al retomar el ticket')
  }
})
