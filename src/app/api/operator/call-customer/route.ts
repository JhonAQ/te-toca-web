import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { callCustomerSchema } from '@/lib/validations/ticket.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('📞 Calling customer for worker:', worker.id)

    const body = await request.json()
    const validation = callCustomerSchema.safeParse(body)
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber } = validation.data

    console.log('🎫 Calling ticket:', ticketNumber)

    // Buscar el ticket por número
    const ticket = await TicketService.findByNumber(ticketNumber)
    if (!ticket) {
      console.log('❌ Ticket not found:', ticketNumber)
      return notFoundResponse('Ticket no encontrado')
    }

    // Verificar que el worker tiene acceso a esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, ticket.queueId)
    if (!hasAccess) {
      console.log('❌ Worker does not have access to ticket queue:', ticket.queueId)
      return forbiddenResponse('No tienes acceso a esta cola')
    }

    // Verificar que el ticket está en estado válido para llamar
    const validStatuses = ['waiting', 'skipped', 'in_progress']
    if (!validStatuses.includes(ticket.status)) {
      console.log('❌ Ticket cannot be called in current status:', ticket.status)
      return forbiddenResponse(`Este ticket no puede ser llamado (estado: ${ticket.status})`)
    }

    // Si el ticket ya tiene un worker asignado diferente, verificar
    if (ticket.workerId && ticket.workerId !== worker.id) {
      console.log('⚠️ Ticket is assigned to different worker, reassigning to current worker')
    }

    console.log('✅ Calling customer for ticket:', ticketNumber)

    // Llamar al cliente (esto automáticamente asigna el worker al ticket)
    const calledTicket = await TicketService.callTicket(ticket.id, worker.id)
    if (!calledTicket) {
      return internalErrorResponse('Error al llamar al cliente')
    }

    console.log('✅ Customer called successfully for ticket:', ticketNumber)

    return successResponse({
      ticket: {
        id: calledTicket.id,
        number: calledTicket.number,
        customerName: calledTicket.customerName,
        customerPhone: calledTicket.customerPhone,
        customerEmail: calledTicket.customerEmail,
        serviceType: calledTicket.serviceType,
        priority: calledTicket.priority,
        status: calledTicket.status,
        calledAt: calledTicket.calledAt?.toISOString()
      },
      message: `Cliente ${calledTicket.customerName} llamado exitosamente`
    })

  } catch (error) {
    console.error('❌ Error calling customer:', error)
    return internalErrorResponse('Error al llamar al cliente')
  }
})
