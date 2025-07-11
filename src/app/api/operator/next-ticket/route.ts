import { NextRequest } from 'next/server'
import { TicketService } from '@/lib/services/ticket.service'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { nextTicketSchema } from '@/lib/validations/queue.schemas'
import { 
  successResponse, 
  validationErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const GET = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('🎫 Getting REAL next ticket for worker:', worker.id)

    const { searchParams } = new URL(request.url)
    const queueId = searchParams.get('queueId')

    // Validar parámetros
    const validation = nextTicketSchema.safeParse({ queueId })
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { queueId: validatedQueueId } = validation.data

    console.log('🔍 Looking for next ticket in REAL queue:', validatedQueueId)

    // Verificar que el worker tiene acceso a esta cola
    const hasAccess = await WorkerService.validateQueueAccess(worker.id, validatedQueueId)
    if (!hasAccess) {
      console.log('❌ Worker does not have access to queue:', validatedQueueId)
      return forbiddenResponse('No tienes acceso a esta cola')
    }

    // Obtener el siguiente ticket REAL de la cola
    const nextTicket = await TicketService.getNextTicketInQueue(validatedQueueId, worker.id)
    
    if (!nextTicket) {
      console.log('ℹ️ No tickets waiting in queue:', validatedQueueId)
      return successResponse({
        ticket: null,
        message: 'No hay tickets en espera en esta cola'
      })
    }

    console.log('✅ REAL next ticket found:', nextTicket.number, 'for customer:', nextTicket.customerName)

    return successResponse({
      ticket: {
        id: nextTicket.id,
        number: nextTicket.number,
        customerName: nextTicket.customerName,
        customerPhone: nextTicket.customerPhone || null,
        customerEmail: nextTicket.customerEmail || null,
        serviceType: nextTicket.serviceType || 'General',
        priority: nextTicket.priority,
        estimatedWaitTime: nextTicket.estimatedWaitTime,
        position: nextTicket.position,
        createdAt: nextTicket.createdAt
      },
      queueInfo: {
        id: validatedQueueId,
        totalWaiting: await getQueueWaitingCount(validatedQueueId)
      }
    })

  } catch (error) {
    console.error('❌ Error getting REAL next ticket:', error)
    return internalErrorResponse('Error al obtener el siguiente ticket')
  }
})

async function getQueueWaitingCount(queueId: string): Promise<number> {
  try {
    const { db } = await import('@/lib/db')
    return await db.ticket.count({
      where: { queueId, status: 'waiting' }
    })
  } catch (error) {
    console.error('Error counting waiting tickets:', error)
    return 0
  }
}
