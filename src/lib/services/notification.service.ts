import { db } from '@/lib/db'

export type NotificationType = 'ticket_called' | 'ticket_ready' | 'queue_update' | 'general'

export class NotificationService {
  static async createNotification(data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    data?: Record<string, any>
  }) {
    return await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {}
      }
    })
  }

  static async getUserNotifications(
    userId: string, 
    unread?: boolean, 
    page = 1, 
    limit = 20
  ) {
    const where: any = { userId }
    if (unread !== undefined) {
      where.isRead = !unread
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.notification.count({
        where: { userId, isRead: false }
      })
    ])

    return {
      notifications,
      unreadCount
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await db.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw new Error('Notificación no encontrada')
    }

    if (notification.userId !== userId) {
      throw new Error('No tienes permisos para modificar esta notificación')
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })
  }

  static async markAllAsRead(userId: string) {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  }

  static async notifyTicketCalled(ticketId: string) {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
        queue: {
          include: { company: true }
        }
      }
    })

    if (!ticket) return

    await this.createNotification({
      userId: ticket.userId,
      type: 'ticket_called',
      title: 'Tu turno ha sido llamado',
      message: `Tu ticket ${ticket.number} está siendo atendido en ${ticket.queue.name}`,
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.number,
        queueId: ticket.queueId,
        queueName: ticket.queue.name,
        companyId: ticket.queue.company.id,
        companyName: ticket.queue.company.name
      }
    })
  }

  static async notifyTicketReady(ticketId: string) {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: true,
        queue: {
          include: { company: true }
        }
      }
    })

    if (!ticket) return

    // Verificar si hay pocos tickets adelante
    const ticketsAhead = await db.ticket.count({
      where: {
        queueId: ticket.queueId,
        status: 'waiting',
        createdAt: { lt: ticket.createdAt }
      }
    })

    if (ticketsAhead <= 3) {
      await this.createNotification({
        userId: ticket.userId,
        type: 'ticket_ready',
        title: 'Tu turno está próximo',
        message: `Faltan ${ticketsAhead} personas para tu turno en ${ticket.queue.name}`,
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.number,
          queueId: ticket.queueId,
          queueName: ticket.queue.name,
          companyId: ticket.queue.company.id,
          companyName: ticket.queue.company.name,
          ticketsAhead
        }
      })
    }
  }

  static async notifyQueueUpdate(queueId: string, message: string) {
    const tickets = await db.ticket.findMany({
      where: {
        queueId,
        status: { in: ['waiting', 'called', 'paused'] }
      },
      include: {
        queue: {
          include: { company: true }
        }
      }
    })

    const notifications = tickets.map(ticket => ({
      userId: ticket.userId,
      type: 'queue_update' as NotificationType,
      title: 'Actualización de cola',
      message: `${ticket.queue.name}: ${message}`,
      data: {
        queueId: ticket.queueId,
        queueName: ticket.queue.name,
        companyId: ticket.queue.company.id,
        companyName: ticket.queue.company.name
      }
    }))

    await db.notification.createMany({
      data: notifications
    })
  }

  static async sendPushNotification(userId: string, notification: {
    title: string
    message: string
    data?: Record<string, any>
  }) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true }
    })

    if (!user || !user.pushTokens) return

    const tokens = user.pushTokens as string[]
    
    // Aquí implementarías el envío real de push notifications
    // usando servicios como Firebase Cloud Messaging, Expo Push, etc.
    
    console.log(`📱 Enviando push notification a ${tokens.length} dispositivos:`, {
      title: notification.title,
      message: notification.message,
      data: notification.data
    })
  }
}
