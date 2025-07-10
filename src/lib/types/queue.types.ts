export interface Queue {
  id: string
  name: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  isActive: boolean
  tenantId: string
  companyId?: string
  waitingCount: number
  averageWaitTime: number
  totalProcessedToday: number
  createdAt: Date
  updatedAt: Date
}

export interface QueueStats {
  totalQueues: number
  totalWaiting: number
  averageWaitTime: number
  activeOperators: number
}

export interface QueueWithStats extends Queue {
  stats: {
    currentOperators: number
    estimatedWaitTime: number
    nextTicketPosition: number
  }
}

export interface WorkerQueueAssignment {
  workerId: string
  queueId: string
  assignedAt: Date
  isActive: boolean
}

export type QueuePriority = 'low' | 'medium' | 'high'
export type QueueStatus = 'active' | 'paused' | 'closed'
