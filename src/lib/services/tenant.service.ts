import { db } from '@/lib/db'
import { Tenant as PrismaTenant } from '@prisma/client'

interface Tenant {
  id: string
  name: string
  isActive: boolean
}

export class TenantService {
  // Mock data para desarrollo
  private static mockTenants: Tenant[] = [
    {
      id: 'default',
      name: 'Empresa Demo',
      isActive: true
    },
    {
      id: 'interland',
      name: 'Interland',
      isActive: true
    }
  ]

  static async findById(id: string): Promise<Tenant | null> {
    // En desarrollo, buscar en datos mock
    if (process.env.NODE_ENV === 'development') {
      return this.mockTenants.find(t => t.id === id) || null
    }

    // Aquí iría la lógica real para buscar en base de datos
    return null
  }

  static async findByIdWithCompanies(id: string) {
    return await db.tenant.findUnique({
      where: { id, isActive: true },
      include: {
        companies: {
          where: { isActive: true },
          include: {
            _count: {
              select: { queues: { where: { isActive: true } } }
            }
          }
        }
      }
    })
  }

  static async getAll() {
    return await db.tenant.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { 
            companies: { where: { isActive: true } },
            queues: { where: { isActive: true } },
            workers: { where: { isActive: true } }
          }
        }
      }
    })
  }

  static async validateTenantAccess(tenantId: string): Promise<boolean> {
    const tenant = await this.findById(tenantId)
    return tenant !== null
  }
}
