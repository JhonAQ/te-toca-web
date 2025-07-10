import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { Worker } from '@prisma/client'
import { parseWorkerPermissions } from '@/lib/utils/json-helpers'

interface Worker {
  id: string
  name: string
  username: string
  role: string
  tenantId: string
  permissions: string
  isActive: boolean
}

interface Queue {
  id: string
  name: string
  description: string
  waitingCount: number
  averageWaitTime: number
  isActive: boolean
  priority: string
  category: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export class WorkerService {
  // Mock data para desarrollo
  private static mockWorkers: Worker[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      username: 'juan.perez@demo.com',
      role: 'OPERATOR',
      tenantId: 'default',
      permissions: '{"queues": ["1", "2"], "actions": ["call", "complete", "skip"]}',
      isActive: true
    },
    {
      id: '2',
      name: 'María González',
      username: 'maria.gonzalez@demo.com',
      role: 'OPERATOR',
      tenantId: 'default',
      permissions: '{"queues": ["1"], "actions": ["call", "complete"]}',
      isActive: true
    }
  ]

  private static mockQueues: Queue[] = [
    {
      id: '1',
      name: 'Atención General',
      description: 'Cola principal para consultas generales',
      waitingCount: 8,
      averageWaitTime: 12,
      isActive: true,
      priority: 'medium',
      category: 'General',
      tenantId: 'default',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Soporte Técnico',
      description: 'Resolución de problemas técnicos',
      waitingCount: 3,
      averageWaitTime: 25,
      isActive: true,
      priority: 'high',
      category: 'Técnico',
      tenantId: 'default',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  static async findByCredentials(tenantId: string, username: string): Promise<Worker | null> {
    return await db.worker.findUnique({
      where: {
        tenantId_username: {
          tenantId,
          username
        },
        isActive: true
      },
      include: {
        tenant: true
      }
    })
  }

  static async validateCredentials(tenantId: string, username: string, password: string): Promise<Worker | null> {
    // En desarrollo, aceptar cualquier credencial
    if (process.env.NODE_ENV === 'development') {
      const worker = this.mockWorkers.find(w => w.tenantId === tenantId)
      if (worker) {
        return {
          ...worker,
          username: username,
          name: this.extractNameFromUsername(username)
        }
      }
    }

    const worker = await this.findByCredentials(tenantId, username)
    if (!worker) return null

    const isValid = await verifyPassword(password, worker.password)
    return isValid ? worker : null
  }

  static async findById(id: string): Promise<Worker | null> {
    return await db.worker.findUnique({
      where: { id, isActive: true },
      include: {
        tenant: true,
        currentQueue: true
      }
    })
  }

  static async getAvailableQueues(workerId: string) {
    // En desarrollo, devolver colas mock
    if (process.env.NODE_ENV === 'development') {
      return this.mockQueues
    }

    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: {
        tenant: {
          include: {
            queues: {
              where: { isActive: true },
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
            }
          }
        }
      }
    })

    if (!worker) return []

    return worker.tenant.queues.map(queue => ({
      ...queue,
      waitingCount: queue._count.tickets,
      tenantId: worker.tenantId
    }))
  }

  static async selectQueue(workerId: string, queueId: string): Promise<boolean> {
    // En desarrollo, siempre exitoso
    if (process.env.NODE_ENV === 'development') {
      return true
    }

    // Verificar que la cola pertenece al tenant del worker
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      select: { tenantId: true }
    })

    if (!worker) return false

    const queue = await db.queue.findUnique({
      where: { id: queueId, tenantId: worker.tenantId, isActive: true }
    })

    if (!queue) return false

    // Actualizar el worker con la cola seleccionada
    await db.worker.update({
      where: { id: workerId },
      data: { currentQueueId: queueId }
    })

    return true
  }

  static async togglePause(workerId: string, isPaused: boolean): Promise<boolean> {
    await db.worker.update({
      where: { id: workerId },
      data: { isPaused }
    })

    return true
  }

  static async getActiveOperatorsCount(tenantId: string): Promise<number> {
    // En desarrollo, devolver número mock
    if (process.env.NODE_ENV === 'development') {
      return Math.floor(Math.random() * 10) + 3 // Entre 3 y 12 operarios
    }

    // En producción, contar operarios activos
    try {
      const count = await db.worker.count({
        where: {
          tenantId,
          isActive: true,
          isPaused: false,
          currentQueueId: { not: null } // Solo los que están asignados a una cola
        }
      })
      return count
    } catch (error) {
      console.error('Error counting active operators:', error)
      return 0
    }
  }

  static async getWorkerCurrentQueue(workerId: string) {
    // En desarrollo, devolver cola mock si está asignada
    if (process.env.NODE_ENV === 'development') {
      return this.mockQueues[0] // Devolver primera cola como ejemplo
    }

    return await db.worker.findUnique({
      where: { id: workerId },
      select: {
        currentQueue: {
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
        }
      }
    }).then(result => result?.currentQueue || null)
  }

  static async unassignFromQueue(workerId: string): Promise<boolean> {
    // En desarrollo, siempre exitoso
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mock: Unassigning worker from queue')
      return true
    }

    try {
      await db.worker.update({
        where: { id: workerId },
        data: { 
          currentQueueId: null,
          isPaused: false
        }
      })
      return true
    } catch (error) {
      console.error('Error unassigning worker from queue:', error)
      return false
    }
  }

  private static extractNameFromUsername(username: string): string {
    if (username.includes('@')) {
      const localPart = username.split('@')[0]
      return localPart
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
  }
}
