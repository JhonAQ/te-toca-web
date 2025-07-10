import { db } from '@/lib/db'
import { Queue, Ticket } from '@prisma/client'

export class QueueService {
  static async findById(id: string) {
    return await db.queue.findUnique({
      where: { id, isActive: true },
      include: {
        company: true,
        tenant: true,
        _count: {
          select: {
            tickets: {
              where: { status: 'waiting' }
            }
          }
        }
      }
    })
  }

  static async findByIdWithStats(id: string) {
    const queue = await db.queue.findUnique({
      where: { id, isActive: true },
      include: {
        company: true,
        tenant: true,
        tickets: {
          where: { status: { in: ['waiting', 'called'] } },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!queue) return null

    const waitingCount = queue.tickets.filter(t => t.status === 'waiting').length
    const currentTicket = queue.tickets.find(t => t.status === 'called')
    const lastProcessedTicket = await db.ticket.findFirst({
      where: { queueId: id, status: 'completed' },
      orderBy: { completedAt: 'desc' }
    })

    return {
      ...queue,
      peopleWaiting: waitingCount,
      currentTicketNumber: currentTicket?.number || null,
      lastCalledTicket: lastProcessedTicket?.number || null,
      estimatedWaitTime: waitingCount * queue.averageWaitTime
    }
  }

  static async getPublicQueues(companyId: string) {
    return await db.queue.findMany({
      where: { 
        companyId, 
        isActive: true 
      },
      include: {
        company: true,
        _count: {
          select: {
            tickets: {
              where: { status: 'waiting' }
            }
          }
        }
      }
    })
  }

  static async getQueuesByTenant(tenantId: string) {
    return await db.queue.findMany({
      where: { 
        tenantId, 
        isActive: true 
      },
      include: {
        company: true,
        _count: {
          select: {
            tickets: {
              where: { status: 'waiting' }
            }
          }
        }
      }
    })
  }

  static async getQueueStatus(queueId: string) {
    const queue = await this.findByIdWithStats(queueId)
    if (!queue) return null

    const upcomingTickets = await db.ticket.findMany({
      where: { 
        queueId, 
        status: 'waiting' 
      },
      select: {
        number: true,
        customerName: true,
        priority: true,
        estimatedWaitTime: true
      },
      orderBy: { createdAt: 'asc' },
      take: 5
    })

    const totalProcessedToday = await db.ticket.count({
      where: {
        queueId,
        status: 'completed',
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    return {
      queueId,
      isActive: queue.isActive,
      waitingCount: queue.peopleWaiting,
      currentTicketNumber: queue.currentTicketNumber,
      lastCalledTicket: queue.lastCalledTicket,
      estimatedWaitTime: queue.estimatedWaitTime,
      averageServiceTime: queue.averageWaitTime,
      totalProcessedToday,
      upcomingTickets,
      lastUpdated: new Date().toISOString()
    }
  }

  static async updateAverageWaitTime(queueId: string) {
    const completedTickets = await db.ticket.findMany({
      where: {
        queueId,
        status: 'completed',
        serviceTime: { gt: 0 },
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 días
        }
      },
      select: { serviceTime: true }
    })

    if (completedTickets.length > 0) {
      const averageServiceTime = Math.round(
        completedTickets.reduce((sum, ticket) => sum + ticket.serviceTime, 0) / completedTickets.length
      )

      await db.queue.update({
        where: { id: queueId },
        data: { averageWaitTime: averageServiceTime }
      })
    }
  }

  static async incrementProcessedToday(queueId: string) {
    await db.queue.update({
      where: { id: queueId },
      data: {
        totalProcessedToday: {
          increment: 1
        }
      }
    })
  }

  static async resetDailyStats() {
    await db.queue.updateMany({
      data: {
        totalProcessedToday: 0
      }
    })
  }
}
