import { Queue, QueuePriority } from '@/lib/types/queue.types'

export function formatQueueForApi(queue: any): Queue {
  return {
    id: queue.id,
    name: queue.name,
    description: queue.description || '',
    category: queue.category || 'General',
    priority: queue.priority || 'medium',
    isActive: queue.isActive ?? true,
    tenantId: queue.tenantId,
    companyId: queue.companyId,
    waitingCount: queue.waitingCount || queue._count?.tickets || 0,
    averageWaitTime: queue.averageWaitTime || 0,
    totalProcessedToday: queue.totalProcessedToday || 0,
    createdAt: queue.createdAt ? new Date(queue.createdAt) : new Date(),
    updatedAt: queue.updatedAt ? new Date(queue.updatedAt) : new Date()
  }
}

export function getPriorityWeight(priority: QueuePriority): number {
  switch (priority) {
    case 'high': return 3
    case 'medium': return 2
    case 'low': return 1
    default: return 2
  }
}

export function sortQueuesByPriority(queues: Queue[]): Queue[] {
  return queues.sort((a, b) => {
    const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
    if (priorityDiff !== 0) return priorityDiff
    
    // Si tienen la misma prioridad, ordenar por número de personas esperando (más urgente primero)
    return b.waitingCount - a.waitingCount
  })
}

export function calculateEstimatedWaitTime(queue: Queue, position: number): number {
  if (queue.averageWaitTime <= 0 || position <= 0) return 0
  
  // Calcular tiempo estimado basado en la posición y el tiempo promedio por persona
  const timePerPerson = queue.averageWaitTime
  return Math.round(timePerPerson * position)
}

export function validateQueueCapacity(queue: Queue, maxCapacity: number = 100): boolean {
  return queue.waitingCount < maxCapacity
}

export function isQueueAvailable(queue: Queue): boolean {
  return queue.isActive && validateQueueCapacity(queue)
}
