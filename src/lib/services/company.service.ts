import { db } from '@/lib/db'

export class CompanyService {
  static async getPublicCompanies(page = 1, limit = 20, search?: string) {
    const where: any = { isActive: true }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        include: {
          _count: {
            select: {
              queues: { where: { isActive: true } }
            }
          }
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.company.count({ where })
    ])

    return {
      companies: companies.map(company => ({
        ...company,
        activeQueues: company._count.queues
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async findById(id: string) {
    const company = await db.company.findUnique({
      where: { id, isActive: true },
      include: {
        queues: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                tickets: { where: { status: 'waiting' } }
              }
            }
          }
        },
        _count: {
          select: {
            queues: { where: { isActive: true } }
          }
        }
      }
    })

    if (!company) return null

    return {
      ...company,
      activeQueues: company._count.queues,
      queues: company.queues.map(queue => ({
        ...queue,
        peopleWaiting: queue._count.tickets,
        avgTime: `${queue.averageWaitTime} min`
      }))
    }
  }

  static async searchCompanies(query: string, page = 1, limit = 20) {
    const companies = await db.company.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortName: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            queues: { where: { isActive: true } }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit
    })

    return {
      companies: companies.map(company => ({
        ...company,
        activeQueues: company._count.queues,
        relevanceScore: this.calculateRelevanceScore(company.name, query)
      })),
      searchQuery: query,
      totalResults: companies.length
    }
  }

  static async getCompaniesByCategory(categoryId: string, page = 1, limit = 20) {
    const [category, companies, total] = await Promise.all([
      db.category.findUnique({
        where: { id: categoryId, isActive: true }
      }),
      db.company.findMany({
        where: { 
          categoryId, 
          isActive: true 
        },
        include: {
          _count: {
            select: {
              queues: { where: { isActive: true } }
            }
          }
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.company.count({
        where: { categoryId, isActive: true }
      })
    ])

    if (!category) {
      throw new Error('Categoría no encontrada')
    }

    return {
      category,
      companies: companies.map(company => ({
        ...company,
        activeQueues: company._count.queues
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async getCompaniesByTenant(tenantId: string) {
    const [tenant, companies] = await Promise.all([
      db.tenant.findUnique({
        where: { id: tenantId, isActive: true }
      }),
      db.company.findMany({
        where: { 
          tenantId, 
          isActive: true 
        },
        include: {
          _count: {
            select: {
              queues: { where: { isActive: true } }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    ])

    if (!tenant) {
      throw new Error('Tenant no encontrado')
    }

    return {
      tenant,
      companies: companies.map(company => ({
        ...company,
        activeQueues: company._count.queues
      }))
    }
  }

  static async getCompanyByTenant(tenantId: string, companyId: string) {
    const company = await db.company.findUnique({
      where: { 
        id: companyId,
        tenantId,
        isActive: true 
      },
      include: {
        queues: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                tickets: { where: { status: 'waiting' } }
              }
            }
          }
        }
      }
    })

    if (!company) return null

    return {
      company,
      queues: company.queues.map(queue => ({
        ...queue,
        peopleWaiting: queue._count.tickets,
        avgTime: `${queue.averageWaitTime} min`
      }))
    }
  }

  private static calculateRelevanceScore(name: string, query: string): number {
    const normalizedName = name.toLowerCase()
    const normalizedQuery = query.toLowerCase()
    
    if (normalizedName === normalizedQuery) return 1.0
    if (normalizedName.startsWith(normalizedQuery)) return 0.9
    if (normalizedName.includes(normalizedQuery)) return 0.7
    
    // Calcular similitud por palabras
    const nameWords = normalizedName.split(' ')
    const queryWords = normalizedQuery.split(' ')
    let matchCount = 0
    
    queryWords.forEach(queryWord => {
      if (nameWords.some(nameWord => nameWord.includes(queryWord))) {
        matchCount++
      }
    })
    
    return matchCount / queryWords.length * 0.5
  }
}
