import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { User } from '@prisma/client'

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email, isActive: true }
    })
  }

  static async findById(id: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { id, isActive: true }
    })
  }

  static async create(data: {
    name: string
    email: string
    phone?: string
    password: string
  }): Promise<User> {
    const hashedPassword = await hashPassword(data.password)
    
    return await db.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })
  }

  static async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user) return null

    const isValid = await verifyPassword(password, user.password)
    return isValid ? user : null
  }

  static async updateProfile(userId: string, data: {
    name?: string
    phone?: string
    profilePicture?: string
  }): Promise<User> {
    return await db.user.update({
      where: { id: userId },
      data
    })
  }

  static async updatePushToken(userId: string, token: string, platform: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true }
    })

    const currentTokens = (user?.pushTokens as string[]) || []
    const newTokens = Array.from(new Set([...currentTokens, token]))

    await db.user.update({
      where: { id: userId },
      data: { pushTokens: newTokens }
    })
  }

  static async getActiveTickets(userId: string) {
    return await db.ticket.findMany({
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
  }

  static async getTicketHistory(userId: string, status?: string, page = 1, limit = 20) {
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

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}
