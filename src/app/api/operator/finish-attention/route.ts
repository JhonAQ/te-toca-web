import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { finishAttentionSchema } from '@/lib/validations/ticket.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('✅ Finishing attention for worker:', worker.id)

    const body = await request.json()
    const validation = finishAttentionSchema.safeParse(body)
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { ticketNumber, notes, serviceRating } = validation.data

    console.log('🎫 Finishing attention for ticket:', ticketNumber)

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

    // LÓGICA MODIFICADA: Verificar si el ticket puede ser completado por este worker
    // En lugar de verificar workerId específico, verificar que:
    // 1. El ticket esté en estado que permita completarlo
    // 2. El worker tenga acceso a la cola
    // 3. Si tiene workerId asignado, que sea este worker O que esté sin asignar
    
    const validStatuses = ['waiting', 'called', 'in_progress']
    if (!validStatuses.includes(ticket.status)) {
      console.log('❌ Ticket cannot be completed in current status:', ticket.status)
      return forbiddenResponse(`Este ticket no puede ser completado (estado: ${ticket.status})`)
    }

    // Si el ticket tiene un worker asignado, verificar que sea este worker
    if (ticket.workerId && ticket.workerId !== worker.id) {
      console.log('❌ Ticket is being handled by different worker:', ticket.workerId, 'vs', worker.id)
      return forbiddenResponse('Este ticket está siendo atendido por otro operario')
    }

    console.log('✅ Ticket can be completed by worker:', worker.id)

    // Completar el ticket
    const completedTicket = await TicketService.completeTicket(ticket.id, notes, serviceRating)
    if (!completedTicket) {
      return internalErrorResponse('Error al completar la atención')
    }

    // Obtener el siguiente ticket en la cola
    const nextTicket = await TicketService.getNextTicketInQueue(ticket.queueId, worker.id)

    console.log('✅ Attention finished successfully for ticket:', ticketNumber)

    return successResponse({
      completedTicket: {
        id: completedTicket.id,
        number: completedTicket.number,
        customerName: completedTicket.customerName,
        status: completedTicket.status,
        serviceTime: completedTicket.serviceTime,
        completedAt: completedTicket.completedAt?.toISOString()
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
      message: `Atención completada para ${completedTicket.customerName}`
    })

  } catch (error) {
    console.error('❌ Error finishing attention:', error)
    return internalErrorResponse('Error al completar la atención')
  }
})
