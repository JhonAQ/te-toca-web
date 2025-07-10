import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { queueStatusQuerySchema } from '@/lib/validations/queue.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('🎫 Getting next ticket for worker:', worker.id)

    const { searchParams } = new URL(request.url)
    const queueId = searchParams.get('queueId')

    // Validar parámetros
    const validation = queueStatusQuerySchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    // Obtener el siguiente ticket en la cola
    const nextTicket = await TicketService.getNextTicketInQueue(validatedQueueId, worker.id)

    if (!nextTicket) {
      console.log('📭 No tickets available in queue:', validatedQueueId)
      return successResponse({
        ticket: null,
        message: 'No hay tickets disponibles en la cola'
      })
    }

    console.log('✅ Next ticket found:', nextTicket.number)

    return successResponse({
      ticket: {
        number: nextTicket.number,
        customerName: nextTicket.customerName,
        customerPhone: nextTicket.customerPhone,
        serviceType: nextTicket.serviceType,
        priority: nextTicket.priority,
        estimatedTime: nextTicket.estimatedWaitTime,
        position: nextTicket.position
      }
    })

  } catch (error) {
    console.error('❌ Error getting next ticket:', error)
    return internalErrorResponse('Error al obtener el siguiente ticket')
  }
})

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('📞 Calling next ticket for worker:', worker.id)

    const body = await request.json()
    const { queueId } = body

    // Validar datos
    const validation = queueStatusQuerySchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    // Obtener y llamar al siguiente ticket
    const nextTicket = await TicketService.getNextTicketInQueue(validatedQueueId, worker.id)
    
    if (!nextTicket) {
      return notFoundResponse('No hay tickets disponibles en la cola')
    }

    // Llamar al ticket
    const calledTicket = await TicketService.callTicket(nextTicket.id, worker.id)
    
    if (!calledTicket) {
      return internalErrorResponse('Error al llamar al siguiente ticket')
    }

    console.log('✅ Next ticket called successfully:', calledTicket.number)

    return successResponse({
      ticket: {
        id: calledTicket.id,
        number: calledTicket.number,
        customerName: calledTicket.customerName,
        customerPhone: calledTicket.customerPhone,
        status: calledTicket.status,
        calledAt: calledTicket.calledAt?.toISOString()
      },
      message: 'Siguiente ticket llamado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error calling next ticket:', error)
    return internalErrorResponse('Error al llamar al siguiente ticket')
  }
})
