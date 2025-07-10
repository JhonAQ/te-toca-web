import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { Worker } from '@prisma/client'
import { parseWorkerPermissions } from '@/lib/utils/json-helpers'

export class WorkerService {
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
}
