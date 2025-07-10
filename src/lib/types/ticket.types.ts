export interface Ticket {
  id: string
  number: string
  queueId: string
  tenantId: string
  userId?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  serviceType?: string
  priority: 'normal' | 'priority'
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'paused'
  position: number
  estimatedWaitTime: number
  actualWaitTime?: number
  serviceTime?: number
  notes?: string
  reason?: string
  workerId?: string
  createdAt: Date
  updatedAt: Date
  calledAt?: Date
  completedAt?: Date
  cancelledAt?: Date
  skippedAt?: Date
  pausedAt?: Date
  resumedAt?: Date
}

export interface TicketStats {
  waitingCount: number
  calledCount: number
  inProgressCount: number
  completedCount: number
  skippedCount: number
  cancelledCount: number
  averageWaitTime: number
  averageServiceTime: number
  totalProcessedToday: number
}

export interface UpcomingTicket {
  number: string
  customerName: string
  estimatedTime: number
  priority: 'normal' | 'priority'
  serviceType?: string
}

export interface SkippedTicket {
  id: string
  number: string
  customerName: string
  customerPhone?: string
  waitTime: number
  reason?: string
  skippedAt: Date
  priority: 'normal' | 'priority'
}

export type TicketStatus = 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'paused'
export type TicketPriority = 'normal' | 'priority'
