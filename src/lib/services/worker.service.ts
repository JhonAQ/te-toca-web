import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { Worker } from '@prisma/client'
import { parseWorkerPermissions } from '@/lib/utils/json-helpers'

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
  static async findByCredentials(tenantId: string, username: string): Promise<Worker | null> {
    try {
      console.log('🔍 Looking for worker:', username, 'in tenant:', tenantId)
      
      const worker = await db.worker.findUnique({
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

      console.log(worker ? '✅ Worker found' : '❌ Worker not found')
      return worker
    } catch (error) {
      console.error('❌ Error finding worker:', error)
      return null
    }
  }

  static async validateCredentials(tenantId: string, username: string, password: string): Promise<Worker | null> {
    try {
      console.log('🔐 Validating credentials for:', username, 'in tenant:', tenantId)
      
      // Buscar el worker por credenciales
      const worker = await this.findByCredentials(tenantId, username)
      if (!worker) {
        console.log('❌ Worker not found')
        return null
      }

      // Verificar la contraseña
      const isValid = await verifyPassword(password, worker.password)
      if (!isValid) {
        console.log('❌ Invalid password')
        return null
      }

      console.log('✅ Credentials validated successfully for:', worker.name)
      return worker
    } catch (error) {
      console.error('❌ Error validating credentials:', error)
      return null
    }
  }

  static async findById(id: string): Promise<Worker | null> {
    try {
      return await db.worker.findUnique({
        where: { id, isActive: true },
        include: {
          tenant: true,
          currentQueue: true
        }
      })
    } catch (error) {
      console.error('❌ Error finding worker by ID:', error)
      return null
    }
  }

  static async getAvailableQueues(workerId: string) {
    try {
      console.log('🔍 Getting available queues for worker:', workerId)

      // Obtener worker con tenant, permisos y colas
      const worker = await db.worker.findUnique({
        where: { id: workerId, isActive: true },
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

      if (!worker) {
        console.log('❌ Worker not found or inactive:', workerId)
        return []
      }

      console.log('✅ Worker found:', worker.name, 'in tenant:', worker.tenant.name)
      console.log('🔍 Raw worker permissions field:', worker.permissions)

      // Parsear permisos del worker
      const permissions = parseWorkerPermissions(worker.permissions)
      console.log('🔍 Parsed permissions object:', permissions)
      const allowedQueueIds = permissions.queues || []

      console.log('🔐 Worker permissions - allowed queues:', allowedQueueIds)
      console.log('🏢 Available queues in tenant:', worker.tenant.queues.map(q => `${q.name} (${q.id})`))

      // Si no hay permisos específicos asignados, permitir acceso a todas las colas del tenant (TEMPORAL)
      let availableQueues = worker.tenant.queues
      
      if (allowedQueueIds.length === 0) {
        console.log('⚠️ No specific permissions found - allowing access to all tenant queues as fallback')
        // En lugar de devolver array vacío, permitir acceso a todas las colas del tenant
      } else {
        // FILTRO CRÍTICO: Solo mostrar colas para las que tiene permisos explícitos
        availableQueues = availableQueues.filter(queue => {
          const hasAccess = allowedQueueIds.includes(queue.id)
          console.log(`🔍 Queue ${queue.name} (${queue.id}): ${hasAccess ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}`)
          return hasAccess
        })
      }

      const formattedQueues = availableQueues.map(queue => ({
        id: queue.id,
        name: queue.name,
        description: queue.description || '',
        waitingCount: queue._count.tickets,
        averageWaitTime: queue.averageWaitTime || 0,
        isActive: queue.isActive,
        priority: queue.priority || 'medium',
        category: queue.category || 'General',
        tenantId: worker.tenantId,
        companyName: queue.company?.name || '',
        createdAt: queue.createdAt,
        updatedAt: queue.updatedAt
      }))

      console.log('✅ Filtered queues for worker:', formattedQueues.length, 'out of', worker.tenant.queues.length, 'total queues')
      console.log('📋 Accessible queues:', formattedQueues.map(q => `${q.name} (${q.id})`).join(', '))

      return formattedQueues
    } catch (error) {
      console.error('❌ Error getting available queues:', error)
      return []
    }
  }

  static async selectQueue(workerId: string, queueId: string): Promise<boolean> {
    try {
      console.log('🔄 Selecting queue:', queueId, 'for worker:', workerId)

      // Verificar que el worker existe y obtener sus permisos
      const worker = await db.worker.findUnique({
        where: { id: workerId, isActive: true },
        select: { tenantId: true, permissions: true, name: true }
      })

      if (!worker) {
        console.log('❌ Worker not found or inactive')
        return false
      }

      console.log('🔍 Worker found:', worker.name, 'checking permissions for queue:', queueId)

      // Verificar que la cola existe y pertenece al tenant del worker ANTES de verificar permisos
      const queue = await db.queue.findUnique({
        where: { id: queueId, tenantId: worker.tenantId, isActive: true }
      })

      if (!queue) {
        console.log('❌ Queue not found, inactive, or belongs to different tenant')
        return false
      }

      console.log('✅ Queue found:', queue.name, 'in tenant:', queue.tenantId)

      // Verificar permisos DESPUÉS de verificar que la cola existe
      const permissions = parseWorkerPermissions(worker.permissions)
      const allowedQueueIds = permissions.queues || []
      
      console.log('🔐 Worker permissions - allowed queues:', allowedQueueIds)
      console.log('🎯 Trying to access queue:', queueId)

      // Si no hay permisos específicos, dar acceso a todas las colas del tenant (TEMPORAL - ajustar según reglas de negocio)
      if (allowedQueueIds.length === 0) {
        console.log('⚠️ No specific queue permissions found - allowing access to all tenant queues as fallback')
      } else if (!allowedQueueIds.includes(queueId)) {
        console.log('❌ Worker does not have permission for queue:', queueId)
        console.log('🔐 Worker allowed queues:', allowedQueueIds)
        return false
      }

      console.log('✅ Permission verified - worker can access queue:', queue.name)

      // Actualizar el worker con la cola seleccionada
      await db.worker.update({
        where: { id: workerId },
        data: { currentQueueId: queueId }
      })

      console.log('✅ Queue selected successfully:', queue.name, 'for worker:', worker.name)
      return true
    } catch (error) {
      console.error('❌ Error selecting queue:', error)
      return false
    }
  }

  static async validateQueueAccess(workerId: string, queueId: string): Promise<boolean> {
    try {
      console.log('🔍 Validating queue access for worker:', workerId, 'queue:', queueId)

      const worker = await db.worker.findUnique({
        where: { id: workerId, isActive: true },
        select: { permissions: true, tenantId: true, name: true }
      })

      if (!worker) {
        console.log('❌ Worker not found for validation')
        return false
      }

      console.log('✅ Worker found for validation:', worker.name)

      // Verificar que la cola existe y pertenece al tenant
      const queue = await db.queue.findUnique({
        where: { id: queueId, tenantId: worker.tenantId, isActive: true }
      })

      if (!queue) {
        console.log('❌ Queue not found or not accessible during validation')
        return false
      }

      console.log('✅ Queue found during validation:', queue.name)

      // Verificar permisos de cola - MISMA LÓGICA QUE EN getAvailableQueues
      const permissions = parseWorkerPermissions(worker.permissions)
      const allowedQueueIds = permissions.queues || []

      console.log('🔐 Validation - Worker permissions allowed queues:', allowedQueueIds)

      // IMPORTANTE: Aplicar la misma lógica que en getAvailableQueues
      if (allowedQueueIds.length === 0) {
        console.log('⚠️ No specific permissions during validation - allowing access as fallback')
        return true // Permitir acceso si no hay permisos específicos (mismo comportamiento que getAvailableQueues)
      }

      const hasAccess = allowedQueueIds.includes(queueId)
      console.log(`🎯 Validation result for queue ${queueId}: ${hasAccess ? 'ACCESS GRANTED' : 'ACCESS DENIED'}`)

      return hasAccess
    } catch (error) {
      console.error('❌ Error validating queue access:', error)
      return false
    }
  }

  static async togglePause(workerId: string, isPaused: boolean): Promise<boolean> {
    try {
      await db.worker.update({
        where: { id: workerId },
        data: { isPaused }
      })
      return true
    } catch (error) {
      console.error('❌ Error toggling pause:', error)
      return false
    }
  }

  static async getActiveOperatorsCount(tenantId: string): Promise<number> {
    try {
      const count = await db.worker.count({
        where: {
          tenantId,
          isActive: true,
          isPaused: false,
          currentQueueId: { not: null }
        }
      })
      return count
    } catch (error) {
      console.error('❌ Error counting active operators:', error)
      return 0
    }
  }

  static async getWorkerCurrentQueue(workerId: string) {
    try {
      const result = await db.worker.findUnique({
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
      })
      return result?.currentQueue || null
    } catch (error) {
      console.error('❌ Error getting worker current queue:', error)
      return null
    }
  }

  static async unassignFromQueue(workerId: string): Promise<boolean> {
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
      console.error('❌ Error unassigning worker from queue:', error)
      return false
    }
  }
}