import { db } from '@/lib/db'
import { Tenant } from '@prisma/client'

export class TenantService {
  static async findById(id: string): Promise<Tenant | null> {
    try {
      console.log('🔍 Looking for tenant:', id)
      
      const tenant = await db.tenant.findUnique({
        where: { id, isActive: true }
      })
      
      console.log(tenant ? '✅ Tenant found:' : '❌ Tenant not found:', tenant?.name || id)
      return tenant
    } catch (error) {
      console.error('❌ Error finding tenant:', error)
      return null
    }
  }

  static async findByIdWithCompanies(id: string) {
    try {
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
    } catch (error) {
      console.error('❌ Error finding tenant with companies:', error)
      return null
    }
  }

  static async getAll() {
    try {
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
    } catch (error) {
      console.error('❌ Error getting all tenants:', error)
      return []
    }
  }

  static async validateTenantAccess(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.findById(tenantId)
      return tenant !== null && tenant.isActive
    } catch (error) {
      console.error('❌ Error validating tenant access:', error)
      return false
    }
  }
}
