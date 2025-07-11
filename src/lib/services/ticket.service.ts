import { db } from '@/lib/db'
import { Ticket, SkippedTicket, UpcomingTicket, TicketStatus } from '@/lib/types/ticket.types'

export class TicketService {
  // Mock data para desarrollo
  private static mockTickets: Ticket[] = [
    {
      id: '1',
      number: 'AB03',
      queueId: '1',
      tenantId: 'default',
      customerName: 'María González',
      customerPhone: '+51 943 123 567',
      customerEmail: 'maria@example.com',
      serviceType: 'Consulta General',
      priority: 'normal',
      status: 'waiting',
      position: 1,
      estimatedWaitTime: 12,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      number: 'CD15',
      queueId: '1',
      tenantId: 'default',
      customerName: 'Pedro Ramírez',
      customerPhone: '+51 987 654 321',
      serviceType: 'Soporte Técnico',
      priority: 'priority',
      status: 'waiting',
      position: 2,
      estimatedWaitTime: 25,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      number: 'EF22',
      queueId: '1',
      tenantId: 'default',
      customerName: 'Ana López',
      serviceType: 'Reclamos',
      priority: 'normal',
      status: 'skipped',
      position: 0,
      estimatedWaitTime: 0,
      reason: 'Cliente no respondió',
      skippedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  static async getNextTicketInQueue(queueId: string, workerId?: string): Promise<Ticket | null> {
    console.log('🎫 Getting REAL next ticket for queue:', queueId)

    try {
      const ticket = await db.ticket.findFirst({
        where: {
          queueId,
          status: 'waiting'
        },
        orderBy: [
          { priority: 'desc' }, // priority tickets first
          { position: 'asc' }   // then by position
        ],
        include: {
          user: true,
          queue: {
            include: {
              company: true
            }
          }
        }
      })

      if (ticket) {
        console.log('✅ REAL next ticket found:', ticket.number, 'for:', ticket.customerName)
        return {
          id: ticket.id,
          number: ticket.number,
          queueId: ticket.queueId,
          tenantId: ticket.tenantId,
          userId: ticket.userId,
          customerName: ticket.customerName,
          customerPhone: ticket.customerPhone,
          customerEmail: ticket.customerEmail,
          serviceType: ticket.serviceType,
          priority: ticket.priority as 'normal' | 'priority',
          status: ticket.status as TicketStatus,
          position: ticket.position,
          estimatedWaitTime: ticket.estimatedWaitTime,
          actualWaitTime: ticket.actualWaitTime,
          serviceTime: ticket.serviceTime,
          notes: ticket.notes,
          reason: ticket.reason,
          workerId: ticket.workerId,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          calledAt: ticket.calledAt,
          completedAt: ticket.completedAt,
          cancelledAt: ticket.cancelledAt,
          skippedAt: ticket.skippedAt,
          pausedAt: ticket.pausedAt,
          resumedAt: ticket.resumedAt
        }
      } else {
        console.log('ℹ️ No REAL tickets waiting in queue:', queueId)
        return null
      }
    } catch (error) {
      console.error('❌ Error getting REAL next ticket:', error)
      return null
    }
  }

  static async callTicket(ticketId: string, workerId: string): Promise<Ticket | null> {
    console.log('📞 Calling REAL ticket:', ticketId, 'by worker:', workerId)

    try {
      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'called',
          workerId, // IMPORTANTE: Asignar el worker al ticket
          calledAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: true,
          queue: true
        }
      })

      console.log('✅ REAL ticket called successfully:', ticket.number, 'assigned to worker:', workerId)
      return this.formatTicketResponse(ticket)
    } catch (error) {
      console.error('❌ Error calling REAL ticket:', error)
      return null
    }
  }

  static async completeTicket(ticketId: string, notes?: string, serviceRating?: number): Promise<Ticket | null> {
    console.log('✅ Completing REAL ticket:', ticketId)

    try {
      const ticket = await db.ticket.findUnique({ where: { id: ticketId } })
      if (!ticket) return null

      const serviceTime = ticket.calledAt 
        ? Math.floor((Date.now() - ticket.calledAt.getTime()) / 1000 / 60)
        : 0

      const actualWaitTime = ticket.createdAt
        ? Math.floor((Date.now() - ticket.createdAt.getTime()) / 1000 / 60)
        : 0

      const updatedTicket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          serviceTime,
          actualWaitTime,
          notes: notes || ticket.notes,
          updatedAt: new Date()
          // Mantener workerId para trazabilidad
        }
      })

      console.log('✅ REAL ticket completed:', updatedTicket.number)
      return this.formatTicketResponse(updatedTicket)
    } catch (error) {
      console.error('❌ Error completing REAL ticket:', error)
      return null
    }
  }

  static async skipTicket(ticketId: string, reason?: string): Promise<Ticket | null> {
    console.log('⏭️ Skipping REAL ticket:', ticketId)

    try {
      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'skipped',
          skippedAt: new Date(),
          reason: reason || 'No especificado',
          updatedAt: new Date()
        }
      })

      console.log('✅ REAL ticket skipped:', ticket.number)
      return this.formatTicketResponse(ticket)
    } catch (error) {
      console.error('❌ Error skipping REAL ticket:', error)
      return null
    }
  }

  static async cancelTicket(ticketId: string, reason: string): Promise<Ticket | null> {
    console.log('❌ Cancelling REAL ticket:', ticketId)

    try {
      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          reason,
          updatedAt: new Date()
        }
      })

      console.log('✅ REAL ticket cancelled:', ticket.number)
      return this.formatTicketResponse(ticket)
    } catch (error) {
      console.error('❌ Error cancelling REAL ticket:', error)
      return null
    }
  }

  static async resumeSkippedTicket(ticketId: string): Promise<Ticket | null> {
    console.log('🔄 Resuming REAL skipped ticket:', ticketId)

    try {
      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'in_progress',
          resumedAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log('✅ REAL skipped ticket resumed:', ticket.number)
      return this.formatTicketResponse(ticket)
    } catch (error) {
      console.error('❌ Error resuming REAL ticket:', error)
      return null
    }
  }

  static async getSkippedTickets(queueId: string): Promise<SkippedTicket[]> {
    console.log('📋 Getting REAL skipped tickets for queue:', queueId)

    try {
      const tickets = await db.ticket.findMany({
        where: {
          queueId,
          status: 'skipped'
        },
        orderBy: { skippedAt: 'asc' },
        include: {
          user: true
        }
      })

      console.log('🔍 Raw skipped tickets from DB:', tickets.length)
      console.log('📊 Tickets details:', tickets.map(t => ({
        id: t.id,
        number: t.number,
        customer: t.customerName,
        status: t.status,
        skippedAt: t.skippedAt
      })))

      const formattedTickets = tickets.map(ticket => ({
        id: ticket.id,
        number: ticket.number,
        customerName: ticket.customerName,
        customerPhone: ticket.customerPhone,
        waitTime: ticket.skippedAt 
          ? Math.floor((Date.now() - ticket.skippedAt.getTime()) / 1000 / 60)
          : 0,
        reason: ticket.reason || 'No especificado',
        skippedAt: ticket.skippedAt || new Date(),
        priority: ticket.priority as 'normal' | 'priority'
      }))

      console.log('✅ Found', formattedTickets.length, 'REAL skipped tickets')
      console.log('📊 Formatted tickets:', formattedTickets)

      return formattedTickets
    } catch (error) {
      console.error('❌ Error getting REAL skipped tickets:', error)
      return []
    }
  }

  static async getUpcomingTickets(queueId: string, limit: number = 5): Promise<UpcomingTicket[]> {
    console.log('👥 Getting REAL upcoming tickets for queue:', queueId)

    try {
      const tickets = await db.ticket.findMany({
        where: {
          queueId,
          status: 'waiting'
        },
        orderBy: [
          { priority: 'desc' },
          { position: 'asc' }
        ],
        take: limit,
        include: {
          user: true
        }
      })

      const upcomingTickets = tickets.map(ticket => ({
        number: ticket.number,
        customerName: ticket.customerName,
        estimatedTime: ticket.estimatedWaitTime,
        priority: ticket.priority as 'normal' | 'priority',
        serviceType: ticket.serviceType
      }))

      console.log('✅ Found', upcomingTickets.length, 'REAL upcoming tickets')
      return upcomingTickets
    } catch (error) {
      console.error('❌ Error getting REAL upcoming tickets:', error)
      return []
    }
  }

  static async findByNumber(ticketNumber: string, queueId?: string): Promise<Ticket | null> {
    try {
      const ticket = await db.ticket.findFirst({
        where: {
          number: ticketNumber,
          ...(queueId && { queueId })
        }
      })

      return ticket ? this.formatTicketResponse(ticket) : null
    } catch (error) {
      console.error('❌ Error finding REAL ticket by number:', error)
      return null
    }
  }

  static async getWaitingTicketsInQueue(queueId: string): Promise<Ticket[]> {
    console.log('📋 Getting REAL waiting tickets for queue:', queueId)

    try {
      const tickets = await db.ticket.findMany({
        where: {
          queueId,
          status: 'waiting' // SOLO tickets en espera
        },
        orderBy: [
          { priority: 'desc' }, // Priority tickets first
          { position: 'asc' },  // Then by position
          { createdAt: 'asc' }  // Finally by creation time
        ],
        include: {
          user: true
        }
      })

      console.log('🔍 Raw waiting tickets from DB:', tickets.length)
      console.log('📊 Waiting tickets details:', tickets.map(t => ({
        id: t.id,
        number: t.number,
        customer: t.customerName,
        status: t.status,
        priority: t.priority,
        position: t.position,
        createdAt: t.createdAt
      })))

      const formattedTickets = tickets.map(ticket => ({
        id: ticket.id,
        number: ticket.number,
        queueId: ticket.queueId,
        tenantId: ticket.tenantId,
        userId: ticket.userId,
        customerName: ticket.customerName,
        customerPhone: ticket.customerPhone,
        customerEmail: ticket.customerEmail,
        serviceType: ticket.serviceType,
        priority: ticket.priority as 'normal' | 'priority',
        status: ticket.status as TicketStatus,
        position: ticket.position,
        estimatedWaitTime: ticket.estimatedWaitTime,
        actualWaitTime: ticket.actualWaitTime,
        serviceTime: ticket.serviceTime,
        notes: ticket.notes,
        reason: ticket.reason,
        workerId: ticket.workerId,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        calledAt: ticket.calledAt,
        completedAt: ticket.completedAt,
        cancelledAt: ticket.cancelledAt,
        skippedAt: ticket.skippedAt,
        pausedAt: ticket.pausedAt,
        resumedAt: ticket.resumedAt
      }))

      console.log('✅ Found', formattedTickets.length, 'REAL waiting tickets')
      return formattedTickets
    } catch (error) {
      console.error('❌ Error getting REAL waiting tickets:', error)
      return []
    }
  }

  private static formatTicketResponse(ticket: any): Ticket {
    return {
      id: ticket.id,
      number: ticket.number,
      queueId: ticket.queueId,
      tenantId: ticket.tenantId,
      userId: ticket.userId,
      customerName: ticket.customerName,
      customerPhone: ticket.customerPhone,
      customerEmail: ticket.customerEmail,
      serviceType: ticket.serviceType,
      priority: ticket.priority as 'normal' | 'priority',
      status: ticket.status as TicketStatus,
      position: ticket.position,
      estimatedWaitTime: ticket.estimatedWaitTime,
      actualWaitTime: ticket.actualWaitTime,
      serviceTime: ticket.serviceTime,
      notes: ticket.notes,
      reason: ticket.reason,
      workerId: ticket.workerId,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      calledAt: ticket.calledAt,
      completedAt: ticket.completedAt,
      cancelledAt: ticket.cancelledAt,
      skippedAt: ticket.skippedAt,
      pausedAt: ticket.pausedAt,
      resumedAt: ticket.resumedAt
    }
  }

  private static async sendNotificationToClient(ticket: any): Promise<void> {
    // Implementar envío de notificaciones push
    console.log('📱 Sending notification to client for ticket:', ticket.number)
    // TODO: Implementar con servicio de notificaciones
  }
}