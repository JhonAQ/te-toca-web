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
    console.log('📞 Calling ticket:', ticketId, 'by worker:', workerId)

    // En desarrollo, simular llamada
    if (process.env.NODE_ENV === 'development') {
      const ticketIndex = this.mockTickets.findIndex(t => t.id === ticketId)
      if (ticketIndex >= 0) {
        this.mockTickets[ticketIndex] = {
          ...this.mockTickets[ticketIndex],
          status: 'called',
          workerId,
          calledAt: new Date(),
          updatedAt: new Date()
        }
        return this.mockTickets[ticketIndex]
      }
      return null
    }

    try {
      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'called',
          workerId,
          calledAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: true,
          queue: true
        }
      })

      // Enviar notificación al cliente (implementar según necesidades)
      await this.sendNotificationToClient(ticket)

      return ticket
    } catch (error) {
      console.error('❌ Error calling ticket:', error)
      return null
    }
  }

  static async completeTicket(ticketId: string, notes?: string, serviceRating?: number): Promise<Ticket | null> {
    console.log('✅ Completing ticket:', ticketId)

    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      const ticketIndex = this.mockTickets.findIndex(t => t.id === ticketId)
      if (ticketIndex >= 0) {
        const now = new Date()
        const serviceTime = this.mockTickets[ticketIndex].calledAt 
          ? Math.floor((now.getTime() - this.mockTickets[ticketIndex].calledAt!.getTime()) / 1000 / 60)
          : 0

        this.mockTickets[ticketIndex] = {
          ...this.mockTickets[ticketIndex],
          status: 'completed',
          completedAt: now,
          serviceTime,
          notes: notes || '',
          updatedAt: now
        }
        return this.mockTickets[ticketIndex]
      }
      return null
    }

    try {
      const ticket = await db.ticket.findUnique({ where: { id: ticketId } })
      if (!ticket) return null

      const serviceTime = ticket.calledAt 
        ? Math.floor((Date.now() - ticket.calledAt.getTime()) / 1000 / 60)
        : 0

      const updatedTicket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          serviceTime,
          notes: notes || ticket.notes,
          updatedAt: new Date()
        }
      })

      return updatedTicket
    } catch (error) {
      console.error('❌ Error completing ticket:', error)
      return null
    }
  }

  static async skipTicket(ticketId: string, reason?: string): Promise<Ticket | null> {
    console.log('⏭️ Skipping ticket:', ticketId)

    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      const ticketIndex = this.mockTickets.findIndex(t => t.id === ticketId)
      if (ticketIndex >= 0) {
        this.mockTickets[ticketIndex] = {
          ...this.mockTickets[ticketIndex],
          status: 'skipped',
          skippedAt: new Date(),
          reason: reason || 'Cliente no respondió',
          updatedAt: new Date()
        }
        return this.mockTickets[ticketIndex]
      }
      return null
    }

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

      return ticket
    } catch (error) {
      console.error('❌ Error skipping ticket:', error)
      return null
    }
  }

  static async cancelTicket(ticketId: string, reason: string): Promise<Ticket | null> {
    console.log('❌ Cancelling ticket:', ticketId)

    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      const ticketIndex = this.mockTickets.findIndex(t => t.id === ticketId)
      if (ticketIndex >= 0) {
        this.mockTickets[ticketIndex] = {
          ...this.mockTickets[ticketIndex],
          status: 'cancelled',
          cancelledAt: new Date(),
          reason,
          updatedAt: new Date()
        }
        return this.mockTickets[ticketIndex]
      }
      return null
    }

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

      return ticket
    } catch (error) {
      console.error('❌ Error cancelling ticket:', error)
      return null
    }
  }

  static async resumeSkippedTicket(ticketId: string): Promise<Ticket | null> {
    console.log('🔄 Resuming skipped ticket:', ticketId)

    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      const ticketIndex = this.mockTickets.findIndex(t => t.id === ticketId)
      if (ticketIndex >= 0) {
        this.mockTickets[ticketIndex] = {
          ...this.mockTickets[ticketIndex],
          status: 'in_progress',
          resumedAt: new Date(),
          updatedAt: new Date()
        }
        return this.mockTickets[ticketIndex]
      }
      return null
    }

    try {
      const ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'in_progress',
          resumedAt: new Date(),
          updatedAt: new Date()
        }
      })

      return ticket
    } catch (error) {
      console.error('❌ Error resuming ticket:', error)
      return null
    }
  }

  static async getSkippedTickets(queueId: string): Promise<SkippedTicket[]> {
    console.log('📋 Getting skipped tickets for queue:', queueId)

    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      const skippedTickets = this.mockTickets
        .filter(t => t.queueId === queueId && t.status === 'skipped')
        .map(ticket => ({
          id: ticket.id,
          number: ticket.number,
          customerName: ticket.customerName,
          customerPhone: ticket.customerPhone,
          waitTime: ticket.skippedAt 
            ? Math.floor((Date.now() - ticket.skippedAt.getTime()) / 1000 / 60)
            : 0,
          reason: ticket.reason || 'No especificado',
          skippedAt: ticket.skippedAt || new Date(),
          priority: ticket.priority
        }))

      console.log('✅ Found', skippedTickets.length, 'skipped tickets')
      return skippedTickets
    }

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

      return tickets.map(ticket => ({
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
    } catch (error) {
      console.error('❌ Error getting skipped tickets:', error)
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
    // En desarrollo
    if (process.env.NODE_ENV === 'development') {
      return this.mockTickets.find(t => 
        t.number === ticketNumber && (!queueId || t.queueId === queueId)
      ) || null
    }

    try {
      const ticket = await db.ticket.findFirst({
        where: {
          number: ticketNumber,
          ...(queueId && { queueId })
        }
      })

      return ticket
    } catch (error) {
      console.error('❌ Error finding ticket by number:', error)
      return null
    }
  }

  private static async sendNotificationToClient(ticket: any): Promise<void> {
    // Implementar envío de notificaciones push
    console.log('📱 Sending notification to client for ticket:', ticket.number)
    // TODO: Implementar con servicio de notificaciones
  }
}