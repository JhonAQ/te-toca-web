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
    console.log('🔍 Finding REAL queue by ID:', id)
    
    try {
      const queue = await db.queue.findUnique({
        where: { id },
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

      if (queue) {
        console.log('✅ REAL Queue found:', queue.name, 'in tenant:', queue.tenant.name)
        return {
          id: queue.id,
          name: queue.name,
          description: queue.description || '',
          tenantId: queue.tenantId,
          isActive: queue.isActive,
          waitingCount: queue._count.tickets,
          averageWaitTime: queue.averageWaitTime || 0,
          priority: queue.priority || 'medium',
          category: queue.category || 'General',
          companyName: queue.company?.name || ''
        }
      } else {
        console.log('❌ REAL Queue not found for ID:', id)
        return null
      }
    } catch (error) {
      console.error('❌ Error finding REAL queue:', error)
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
    console.log('📊 Getting REAL stats for queue:', queueId)
    
    try {
      const [waitingCount, avgWaitTime, processedToday, operators] = await Promise.all([
        // Contar tickets en espera REALES
        db.ticket.count({
          where: { queueId, status: 'waiting' }
        }),
        
        // Calcular tiempo promedio de espera REAL
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
        
        // Contar procesados hoy REALES
        db.ticket.count({
          where: {
            queueId,
            status: 'completed',
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Contar operarios asignados REALES
        db.worker.count({
          where: { currentQueueId: queueId, isActive: true }
        })
      ])

      const realStats = {
        waitingCount,
        averageWaitTime: Math.round(avgWaitTime._avg.actualWaitTime || 0),
        totalProcessedToday: processedToday,
        currentOperators: operators
      }

      console.log('✅ REAL queue stats:', realStats)
      return realStats
    } catch (error) {
      console.error('❌ Error getting REAL queue stats:', error)
      return {
        waitingCount: 0,
        averageWaitTime: 0,
        totalProcessedToday: 0,
        currentOperators: 0
      }
    }
  }
}