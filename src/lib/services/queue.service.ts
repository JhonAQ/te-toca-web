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
    // En desarrollo, simular búsqueda de cola
    if (process.env.NODE_ENV === 'development') {
      return {
        id: id,
        name: 'Cola Demo',
        description: 'Cola de demostración',
        tenantId: 'default',
        isActive: true
      }
    }

    return await db.queue.findUnique({
      where: { id }
    })
  }

  static async findByTenant(tenantId: string): Promise<Queue[]> {
    // En desarrollo, devolver colas mock
    if (process.env.NODE_ENV === 'development') {
      return [
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
        }
      ]
    }

    // Aquí iría la lógica real de base de datos
    return []
  }
}