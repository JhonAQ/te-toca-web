import { db } from '@/lib/db'
import { NotificationService } from '@/lib/services/notification.service'

export class QueueMonitor {
  static async checkAndNotifyUpcomingTurns() {
    // Buscar tickets que están próximos a ser atendidos
    const tickets = await db.ticket.findMany({
      where: {
        status: 'waiting'
      },
      include: {
        queue: {
          include: { company: true }
        },
        user: true
      }
    })

    for (const ticket of tickets) {
      // Contar cuántos tickets hay adelante
      const ticketsAhead = await db.ticket.count({
        where: {
          queueId: ticket.queueId,
          status: 'waiting',
          createdAt: { lt: ticket.createdAt }
        }
      })

      // Notificar si quedan 3 o menos personas adelante
      if (ticketsAhead <= 3) {
        // Verificar si ya se envió esta notificación
        const existingNotification = await db.notification.findFirst({
          where: {
            userId: ticket.userId,
            type: 'ticket_ready',
            data: {
              path: ['ticketId'],
              equals: ticket.id
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 60 * 1000) // últimos 30 minutos
            }
          }
        })

        if (!existingNotification) {
          await NotificationService.notifyTicketReady(ticket.id)
        }
      }
    }
  }

  static async updateQueueStatistics() {
    const queues = await db.queue.findMany({
      where: { isActive: true }
    })

    for (const queue of queues) {
      // Actualizar tiempo promedio de espera
      const completedTicketsToday = await db.ticket.findMany({
        where: {
          queueId: queue.id,
          status: 'completed',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        select: { serviceTime: true }
      })

      if (completedTicketsToday.length > 0) {
        const averageServiceTime = Math.round(
          completedTicketsToday.reduce((sum, ticket) => sum + ticket.serviceTime, 0) / 
          completedTicketsToday.length
        )

        await db.queue.update({
          where: { id: queue.id },
          data: { 
            averageWaitTime: averageServiceTime,
            totalProcessedToday: completedTicketsToday.length
          }
        })
      }
    }
  }

  static async resetDailyCounters() {
    await db.queue.updateMany({
      data: {
        totalProcessedToday: 0
      }
    })
  }

  static async cleanupOldNotifications() {
    // Eliminar notificaciones de más de 30 días
    await db.notification.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
  }

  static async startMonitoring() {
    // Ejecutar cada 2 minutos
    setInterval(async () => {
      try {
        await this.checkAndNotifyUpcomingTurns()
      } catch (error) {
        console.error('Error en monitoreo de colas:', error)
      }
    }, 2 * 60 * 1000)

    // Actualizar estadísticas cada 10 minutos
    setInterval(async () => {
      try {
        await this.updateQueueStatistics()
      } catch (error) {
        console.error('Error actualizando estadísticas:', error)
      }
    }, 10 * 60 * 1000)

    // Limpiar notificaciones viejas cada día
    setInterval(async () => {
      try {
        await this.cleanupOldNotifications()
      } catch (error) {
        console.error('Error limpiando notificaciones:', error)
      }
    }, 24 * 60 * 60 * 1000)

    // Resetear contadores diarios a medianoche
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()
    
    setTimeout(async () => {
      await this.resetDailyCounters()
      
      // Configurar para que se ejecute cada 24 horas
      setInterval(async () => {
        try {
          await this.resetDailyCounters()
        } catch (error) {
          console.error('Error reseteando contadores diarios:', error)
        }
      }, 24 * 60 * 60 * 1000)
    }, timeUntilMidnight)

    console.log('✅ Monitor de colas iniciado')
  }
}
