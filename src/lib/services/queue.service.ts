import { db } from '@/lib/db'

interface Queue {
  id: string
  name: string
  description: string
  tenantId: string
  isActive: boolean
}

export class QueueService {
  static async findById(id: string): Promise<Queue | null> {
    console.log('🔍 Finding queue by ID:', id)
    
    // En desarrollo, simular búsqueda de cola
    if (process.env.NODE_ENV === 'development') {
      const mockQueue = {
        id: id,
        name: id === '1' ? 'Atención General' : id === '2' ? 'Soporte Técnico' : 'Cola Demo',
        description: id === '1' ? 'Cola principal para consultas generales' : 
                     id === '2' ? 'Resolución de problemas técnicos' : 'Cola de demostración',
        tenantId: 'default',
        isActive: true
      }
      console.log('✅ Mock queue found:', mockQueue.name)
      return mockQueue
    }

    try {
      const queue = await db.queue.findUnique({
        where: { id },
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

      console.log(queue ? '✅ Queue found' : '❌ Queue not found', 'for ID:', id)
      return queue
    } catch (error) {
      console.error('❌ Error finding queue:', error)
      return null
    }
  }

  static async findByTenant(tenantId: string): Promise<Queue[]> {
    console.log('🔍 Finding queues for tenant:', tenantId)
    
    // En desarrollo, devolver colas mock
    if (process.env.NODE_ENV === 'development') {
      const mockQueues = [
        {
          id: '1',
          name: 'Atención General',
          description: 'Cola principal para consultas generales',
          tenantId: tenantId,
          isActive: true
        },
        {
          id: '2',
          name: 'Soporte Técnico',
          description: 'Resolución de problemas técnicos',
          tenantId: tenantId,
          isActive: true
        },
        {
          id: '3',
          name: 'Ventas',
          description: 'Información de productos y servicios',
          tenantId: tenantId,
          isActive: false // Cola inactiva para testing
        }
      ]
      console.log('✅ Mock queues found:', mockQueues.length)
      return mockQueues
    }

    try {
      const queues = await db.queue.findMany({
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
        },
        orderBy: { createdAt: 'asc' }
      })

      console.log('✅ Found', queues.length, 'queues for tenant:', tenantId)
      return queues
    } catch (error) {
      console.error('❌ Error finding queues for tenant:', error)
      return []
    }
  }

  static async validateQueueAccess(queueId: string, tenantId: string): Promise<boolean> {
    const queue = await this.findById(queueId)
    return queue !== null && queue.tenantId === tenantId && queue.isActive
  }

  static async getQueueStats(queueId: string) {
    console.log('📊 Getting stats for queue:', queueId)
    
    // En desarrollo, devolver stats mock
    if (process.env.NODE_ENV === 'development') {
      return {
        waitingCount: Math.floor(Math.random() * 15) + 1,
        averageWaitTime: Math.floor(Math.random() * 20) + 5,
        totalProcessedToday: Math.floor(Math.random() * 50) + 10,
        currentOperators: Math.floor(Math.random() * 3) + 1
      }
    }

    try {
      const [waitingCount, avgWaitTime, processedToday, operators] = await Promise.all([
        // Contar tickets en espera
        db.ticket.count({
          where: { queueId, status: 'waiting' }
        }),
        
        // Calcular tiempo promedio de espera
        db.ticket.aggregate({
          where: { 
            queueId, 
            status: 'completed',
            completedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 días
            }
          },
          _avg: { actualWaitTime: true }
        }),
        
        // Contar procesados hoy
        db.ticket.count({
          where: {
            queueId,
            status: 'completed',
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Contar operarios asignados
        db.worker.count({
          where: { currentQueueId: queueId, isActive: true }
        })
      ])

      return {
        waitingCount,
        averageWaitTime: Math.round(avgWaitTime._avg.actualWaitTime || 0),
        totalProcessedToday: processedToday,
        currentOperators: operators
      }
    } catch (error) {
      console.error('❌ Error getting queue stats:', error)
      return {
        waitingCount: 0,
        averageWaitTime: 0,
        totalProcessedToday: 0,
        currentOperators: 0
      }
    }
  }
}