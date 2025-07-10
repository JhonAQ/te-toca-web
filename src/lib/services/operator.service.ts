import { db } from '@/lib/db'
import { TicketService } from './ticket.service'
import { QueueService } from './queue.service'
import { NotificationService } from './notification.service'

export class OperatorService {
  static async getNextTicket(workerId: string, queueId: string) {
    // Verificar que el worker tenga acceso
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker) {
      throw new Error('Worker no encontrado')
    }

    // Verificar que la cola pertenece al tenant del worker
    const queue = await db.queue.findUnique({
      where: { id: queueId, tenantId: worker.tenantId }
    })

    if (!queue) {
      throw new Error('No tienes acceso a esta cola')
    }

    return await TicketService.getNextTicketInQueue(queueId)
  }

  static async getQueueStatus(workerId: string, queueId: string) {
    // Verificar acceso
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker) {
      throw new Error('Worker no encontrado')
    }

    const queue = await db.queue.findUnique({
      where: { id: queueId, tenantId: worker.tenantId }
    })

    if (!queue) {
      throw new Error('No tienes acceso a esta cola')
    }

    return await QueueService.getQueueStatus(queueId)
  }

  static async callCustomer(workerId: string, ticketNumber: string) {
    const ticket = await TicketService.callTicket(ticketNumber, workerId)
    
    // Enviar notificación al cliente
    await NotificationService.notifyTicketCalled(ticket.id)
    
    return ticket
  }

  static async finishAttention(workerId: string, ticketNumber: string, notes?: string, serviceRating?: number) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    // Verificar que el worker es quien está procesando el ticket
    if (ticket.processedById !== workerId) {
      throw new Error('No tienes permisos para finalizar este ticket')
    }

    return await TicketService.finishAttention(ticketNumber, notes, serviceRating)
  }

  static async skipTurn(workerId: string, ticketNumber: string, reason?: string) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber },
      include: { queue: true }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    // Verificar acceso del worker
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker || worker.tenantId !== ticket.tenantId) {
      throw new Error('No tienes permisos para saltar este ticket')
    }

    return await TicketService.skipTicket(ticketNumber, reason)
  }

  static async cancelTicket(workerId: string, ticketNumber: string, reason: string) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber },
      include: { queue: true }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    // Verificar acceso del worker
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker || worker.tenantId !== ticket.tenantId) {
      throw new Error('No tienes permisos para cancelar este ticket')
    }

    return await TicketService.cancelTicket(ticket.id, reason)
  }

  static async selectSkippedTicket(workerId: string, ticketNumber: string) {
    return await TicketService.selectSkippedTicket(ticketNumber, workerId)
  }

  static async getSkippedTickets(workerId: string, queueId: string) {
    // Verificar acceso
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker) {
      throw new Error('Worker no encontrado')
    }

    const queue = await db.queue.findUnique({
      where: { id: queueId, tenantId: worker.tenantId }
    })

    if (!queue) {
      throw new Error('No tienes acceso a esta cola')
    }

    const skippedTickets = await TicketService.getSkippedTickets(queueId)
    
    return {
      skippedTickets: skippedTickets.map(ticket => ({
        id: ticket.id,
        number: ticket.number,
        customerName: ticket.user.name,
        customerPhone: ticket.user.phone,
        waitTime: ticket.skippedAt ? 
          Math.round((new Date().getTime() - ticket.skippedAt.getTime()) / 60000) : 0,
        reason: ticket.reason,
        skippedAt: ticket.skippedAt?.toISOString(),
        priority: ticket.priority
      }))
    }
  }

  static async getQueueDetails(workerId: string, queueId: string) {
    // Verificar acceso
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker) {
      throw new Error('Worker no encontrado')
    }

    const queue = await db.queue.findUnique({
      where: { id: queueId, tenantId: worker.tenantId },
      include: {
        tickets: {
          where: { status: { in: ['waiting', 'called', 'in_progress'] } },
          include: { user: true },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: {
            tickets: { where: { status: 'waiting' } }
          }
        }
      }
    })

    if (!queue) {
      throw new Error('No tienes acceso a esta cola')
    }

    return {
      queue: {
        id: queue.id,
        name: queue.name,
        description: queue.description,
        isActive: queue.isActive,
        waitingCount: queue._count.tickets,
        averageWaitTime: queue.averageWaitTime
      },
      tickets: queue.tickets.map(ticket => ({
        id: ticket.id,
        number: ticket.number,
        customerName: ticket.user.name,
        serviceType: ticket.serviceType,
        estimatedTime: ticket.estimatedWaitTime,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString()
      }))
    }
  }
}
