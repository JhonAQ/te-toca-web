import { db } from '@/lib/db'

export class CategoryService {
  static async getAll() {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return { categories }
  }

  static async findById(id: string) {
    return await db.category.findUnique({
      where: { id, isActive: true }
    })
  }

  static async updateEnterpriseCount(categoryId: string) {
    const count = await db.company.count({
      where: { 
        categoryId, 
        isActive: true 
      }
    })

    await db.category.update({
      where: { id: categoryId },
      data: { enterpriseCount: count }
    })
  }
}
