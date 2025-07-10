// Mock de base de datos para desarrollo
// En producción esto sería reemplazado por Prisma o el ORM real

interface Worker {
  id: string
  username: string
  password: string
  tenantId: string
  isActive: boolean
  tenant?: Tenant
  currentQueue?: Queue
  currentQueueId?: string
  isPaused?: boolean
}

interface Tenant {
  id: string
  name: string
  isActive: boolean
  companies?: Company[]
  queues?: Queue[]
  workers?: Worker[]
}

interface Company {
  id: string
  name: string
  tenantId: string
  isActive: boolean
  queues?: Queue[]
}

interface Queue {
  id: string
  name: string
  description: string
  tenantId: string
  isActive: boolean
  company?: Company
  _count?: {
    tickets: number
  }
}

// Mock data
const mockWorkers: Worker[] = [
  {
    id: '1',
    username: 'juan.perez@demo.com',
    password: '$2a$10$mockhashedpassword', // En desarrollo acepta cualquier password
    tenantId: 'default',
    isActive: true
  }
]

const mockTenants: Tenant[] = [
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

const mockQueues: Queue[] = [
  {
    id: '1',
    name: 'Atención General',
    description: 'Cola principal',
    tenantId: 'default',
    isActive: true
  }
]

// Mock DB interface
export const db = {
  worker: {
    async findUnique({ where, include }: any) {
      console.log('🔍 Mock DB: Finding worker with:', where)
      
      if (where.tenantId_username) {
        const worker = mockWorkers.find(w => 
          w.tenantId === where.tenantId_username.tenantId &&
          w.username === where.tenantId_username.username &&
          w.isActive === true
        )
        
        if (worker && include?.tenant) {
          const tenant = mockTenants.find(t => t.id === worker.tenantId)
          return { ...worker, tenant }
        }
        
        return worker || null
      }
      
      if (where.id) {
        const worker = mockWorkers.find(w => w.id === where.id && w.isActive === true)
        
        if (worker && include) {
          const result = { ...worker }
          
          if (include.tenant) {
            const tenant = mockTenants.find(t => t.id === worker.tenantId)
            if (tenant && include.tenant.include?.queues) {
              const queues = mockQueues.filter(q => q.tenantId === tenant.id)
              result.tenant = { 
                ...tenant, 
                queues: queues.map(q => ({
                  ...q,
                  _count: { tickets: Math.floor(Math.random() * 20) + 1 }
                }))
              }
            } else {
              result.tenant = tenant
            }
          }
          
          if (include.currentQueue) {
            const queue = mockQueues.find(q => q.id === worker.currentQueueId)
            result.currentQueue = queue
          }
          
          return result
        }
        
        return worker || null
      }
      
      return null
    },
    
    async update({ where, data }: any) {
      const workerIndex = mockWorkers.findIndex(w => w.id === where.id)
      if (workerIndex >= 0) {
        mockWorkers[workerIndex] = { ...mockWorkers[workerIndex], ...data }
        return mockWorkers[workerIndex]
      }
      throw new Error('Worker not found')
    }
  },
  
  tenant: {
    async findUnique({ where, include }: any) {
      console.log('🔍 Mock DB: Finding tenant with:', where)
      
      const tenant = mockTenants.find(t => t.id === where.id && t.isActive === true)
      
      if (tenant && include) {
        const result = { ...tenant }
        
        if (include.companies) {
          // Mock companies data
          result.companies = []
        }
        
        return result
      }
      
      return tenant || null
    },
    
    async findMany({ where, include }: any) {
      let tenants = mockTenants.filter(t => t.isActive === true)
      
      if (include?._count) {
        tenants = tenants.map(t => ({
          ...t,
          _count: {
            companies: 0,
            queues: mockQueues.filter(q => q.tenantId === t.id).length,
            workers: mockWorkers.filter(w => w.tenantId === t.id).length
          }
        }))
      }
      
      return tenants
    }
  },
  
  queue: {
    async findUnique({ where }: any) {
      return mockQueues.find(q => 
        q.id === where.id && 
        q.tenantId === where.tenantId && 
        q.isActive === where.isActive
      ) || null
    }
  }
}
