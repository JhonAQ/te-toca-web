import { db } from '@/lib/db'
import { generateTicketNumber, calculateEstimatedWaitTime } from '@/lib/utils/ticket'
import { QueueService } from './queue.service'
import { Ticket } from '@prisma/client'

export class TicketService {
  static async createTicket(data: {
    queueId: string
    userId: string
    serviceType?: string
    priority?: 'normal' | 'priority'
    notes?: string
  }) {
    // Verificar que el usuario no tenga un ticket activo en esta cola
    const existingTicket = await db.ticket.findFirst({
      where: {
        queueId: data.queueId,
        userId: data.userId,
        status: { in: ['waiting', 'called', 'paused'] }
      }
    })

    if (existingTicket) {
      throw new Error('Ya tienes un ticket activo en esta cola')
    }

    // Obtener información de la cola y usuario
    const [queue, user] = await Promise.all([
      db.queue.findUnique({
        where: { id: data.queueId },
        include: { company: true, tenant: true }
      }),
      db.user.findUnique({
        where: { id: data.userId }
      })
    ])

    if (!queue || !user) {
      throw new Error('Cola o usuario no encontrado')
    }

    if (!queue.isActive) {
      throw new Error('La cola no está disponible en este momento')
    }

    // Calcular posición en la cola
    const waitingTickets = await db.ticket.count({
      where: {
        queueId: data.queueId,
        status: 'waiting'
      }
    })

    const position = waitingTickets + 1
    const estimatedWaitTime = calculateEstimatedWaitTime(position, queue.averageWaitTime)

    // Generar número único de ticket
    let ticketNumber: string
    let attempts = 0
    do {
      ticketNumber = generateTicketNumber()
      const existing = await db.ticket.findUnique({
        where: { number: ticketNumber }
      })
      if (!existing) break
      attempts++
    } while (attempts < 10)

    if (attempts >= 10) {
      throw new Error('No se pudo generar un número de ticket único')
    }

    // Crear el ticket
    const ticket = await db.ticket.create({
      data: {
        number: ticketNumber,
        queueId: data.queueId,
        tenantId: queue.tenantId,
        userId: data.userId,
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
        serviceType: data.serviceType,
        priority: data.priority || 'normal',
        position,
        estimatedWaitTime,
        notes: data.notes
      },
      include: {
        queue: {
          include: { company: true }
        }
      }
    })

    return {
      ticket: {
        ...ticket,
        enterpriseId: ticket.queue.company.id,
        enterpriseName: ticket.queue.company.name,
        queueName: ticket.queue.name
      },
      queueInfo: {
        name: queue.name,
        currentPosition: position,
        totalWaiting: waitingTickets + 1,
        estimatedWaitTime
      }
    }
  }

  static async findById(id: string, userId?: string) {
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        queue: {
          include: { company: true }
        },
        user: true
      }
    })

    if (!ticket) return null

    // Verificar permisos si se proporciona userId
    if (userId && ticket.userId !== userId) {
      throw new Error('No tienes permisos para ver este ticket')
    }

    // Obtener estado actual de la cola
    const queueStatus = await QueueService.getQueueStatus(ticket.queueId)
    const peopleAhead = await db.ticket.count({
      where: {
        queueId: ticket.queueId,
        status: 'waiting',
        createdAt: { lt: ticket.createdAt }
      }
    })

    return {
      ...ticket,
      enterpriseId: ticket.queue.company.id,
      enterpriseName: ticket.queue.company.name,
      queueName: ticket.queue.name,
      currentQueueStatus: {
        currentTicketNumber: queueStatus?.currentTicketNumber || null,
        peopleAhead,
        estimatedWaitTime: peopleAhead * (ticket.queue.averageWaitTime || 5)
      }
    }
  }

  static async getNextTicketInQueue(queueId: string) {
    return await db.ticket.findFirst({
      where: {
        queueId,
        status: 'waiting'
      },
      orderBy: [
        { priority: 'desc' }, // priority tickets first
        { createdAt: 'asc' }   // then by creation time
      ],
      include: {
        user: true,
        queue: true
      }
    })
  }

  static async callTicket(ticketNumber: string, workerId: string) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber },
      include: { queue: true }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    if (ticket.status !== 'waiting') {
      throw new Error('El ticket no está en estado de espera')
    }

    // Verificar que el worker tenga acceso a esta cola
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker || worker.tenantId !== ticket.tenantId) {
      throw new Error('No tienes permisos para procesar este ticket')
    }

    const updatedTicket = await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'called',
        calledAt: new Date(),
        processedById: workerId
      }
    })

    return updatedTicket
  }

  static async finishAttention(ticketNumber: string, notes?: string, serviceRating?: number) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    if (!['called', 'in_progress'].includes(ticket.status)) {
      throw new Error('El ticket no está siendo atendido')
    }

    const now = new Date()
    const serviceTime = ticket.calledAt ? 
      Math.round((now.getTime() - ticket.calledAt.getTime()) / 60000) : 0

    const updatedTicket = await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'completed',
        completedAt: now,
        serviceTime,
        notes,
        actualWaitTime: ticket.createdAt ? 
          Math.round((now.getTime() - ticket.createdAt.getTime()) / 60000) : 0
      }
    })

    // Actualizar estadísticas de la cola
    await Promise.all([
      QueueService.updateAverageWaitTime(ticket.queueId),
      QueueService.incrementProcessedToday(ticket.queueId)
    ])

    return updatedTicket
  }

  static async skipTicket(ticketNumber: string, reason?: string) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    if (ticket.status !== 'waiting') {
      throw new Error('Solo se pueden saltar tickets en espera')
    }

    return await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'skipped',
        skippedAt: new Date(),
        reason
      }
    })
  }

  static async cancelTicket(ticketId: string, reason: string, userId?: string) {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    // Verificar permisos si es un usuario
    if (userId && ticket.userId !== userId) {
      throw new Error('No tienes permisos para cancelar este ticket')
    }

    if (!['waiting', 'called', 'paused'].includes(ticket.status)) {
      throw new Error('El ticket no se puede cancelar en su estado actual')
    }

    return await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        reason
      }
    })
  }

  static async pauseTicket(ticketId: string, reason?: string) {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    if (!['waiting', 'called'].includes(ticket.status)) {
      throw new Error('El ticket no se puede pausar en su estado actual')
    }

    return await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'paused',
        pausedAt: new Date(),
        reason
      }
    })
  }

  static async resumeTicket(ticketId: string) {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    if (ticket.status !== 'paused') {
      throw new Error('El ticket no está pausado')
    }

    // Recalcular posición en la cola
    const waitingTickets = await db.ticket.count({
      where: {
        queueId: ticket.queueId,
        status: 'waiting'
      }
    })

    const newPosition = waitingTickets + 1
    const queue = await db.queue.findUnique({
      where: { id: ticket.queueId }
    })

    const estimatedWaitTime = newPosition * (queue?.averageWaitTime || 5)

    return await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'waiting',
        resumedAt: new Date(),
        position: newPosition,
        estimatedWaitTime,
        reason: null
      }
    })
  }

  static async getSkippedTickets(queueId: string) {
    return await db.ticket.findMany({
      where: {
        queueId,
        status: 'skipped'
      },
      include: {
        user: true
      },
      orderBy: { skippedAt: 'asc' }
    })
  }

  static async selectSkippedTicket(ticketNumber: string, workerId: string) {
    const ticket = await db.ticket.findUnique({
      where: { number: ticketNumber },
      include: { queue: true }
    })

    if (!ticket) {
      throw new Error('Ticket no encontrado')
    }

    if (ticket.status !== 'skipped') {
      throw new Error('El ticket no está saltado')
    }

    // Verificar permisos del worker
    const worker = await db.worker.findUnique({
      where: { id: workerId }
    })

    if (!worker || worker.tenantId !== ticket.tenantId) {
      throw new Error('No tienes permisos para procesar este ticket')
    }

    return await db.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'in_progress',
        resumedAt: new Date(),
        processedById: workerId
      }
    })
  }

  static async getUserTickets(userId: string, status?: string, page = 1, limit = 20) {
    const where: any = { userId }
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        include: {
          queue: {
            include: { company: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.ticket.count({ where })
    ])

    const stats = await db.ticket.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    })

    const statsObject = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return {
      tickets: tickets.map(ticket => ({
        ...ticket,
        enterpriseId: ticket.queue.company.id,
        enterpriseName: ticket.queue.company.name,
        queueName: ticket.queue.name
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        active: (statsObject.waiting || 0) + (statsObject.called || 0) + (statsObject.paused || 0),
        completed: statsObject.completed || 0,
        cancelled: statsObject.cancelled || 0
      }
    }
  }

  static async getUserActiveTickets(userId: string) {
    const tickets = await db.ticket.findMany({
      where: {
        userId,
        status: { in: ['waiting', 'called', 'paused'] }
      },
      include: {
        queue: {
          include: { company: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const queueStatus = await QueueService.getQueueStatus(ticket.queueId)
        const peopleAhead = await db.ticket.count({
          where: {
            queueId: ticket.queueId,
            status: 'waiting',
            createdAt: { lt: ticket.createdAt }
          }
        })

        return {
          ...ticket,
          enterpriseId: ticket.queue.company.id,
          enterpriseName: ticket.queue.company.name,
          queueName: ticket.queue.name,
          currentQueueStatus: {
            currentTicketNumber: queueStatus?.currentTicketNumber || null,
            peopleAhead
          }
        }
      })
    )

    return { activeTickets: enrichedTickets }
  }
}
