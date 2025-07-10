import { db } from '@/lib/db'
import { Tenant } from '@prisma/client'

export class TenantService {
  static async findById(id: string): Promise<Tenant | null> {
    return await db.tenant.findUnique({
      where: { id, isActive: true }
    })
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
