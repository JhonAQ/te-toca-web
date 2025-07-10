import { Ticket, TicketStatus, TicketPriority } from '@/lib/types/ticket.types'

export function formatTicketForApi(ticket: any): Ticket {
  return {
    id: ticket.id,
    number: ticket.number,
    queueId: ticket.queueId,
    tenantId: ticket.tenantId,
    userId: ticket.userId,
    customerName: ticket.customerName,
    customerPhone: ticket.customerPhone,
    customerEmail: ticket.customerEmail,
    serviceType: ticket.serviceType,
    priority: ticket.priority || 'normal',
    status: ticket.status || 'waiting',
    position: ticket.position || 0,
    estimatedWaitTime: ticket.estimatedWaitTime || 0,
    actualWaitTime: ticket.actualWaitTime,
    serviceTime: ticket.serviceTime,
    notes: ticket.notes,
    reason: ticket.reason,
    workerId: ticket.workerId,
    createdAt: ticket.createdAt ? new Date(ticket.createdAt) : new Date(),
    updatedAt: ticket.updatedAt ? new Date(ticket.updatedAt) : new Date(),
    calledAt: ticket.calledAt ? new Date(ticket.calledAt) : undefined,
    completedAt: ticket.completedAt ? new Date(ticket.completedAt) : undefined,
    cancelledAt: ticket.cancelledAt ? new Date(ticket.cancelledAt) : undefined,
    skippedAt: ticket.skippedAt ? new Date(ticket.skippedAt) : undefined,
    pausedAt: ticket.pausedAt ? new Date(ticket.pausedAt) : undefined,
    resumedAt: ticket.resumedAt ? new Date(ticket.resumedAt) : undefined
  }
}

export function isValidTicketTransition(from: TicketStatus, to: TicketStatus): boolean {
  const validTransitions: Record<TicketStatus, TicketStatus[]> = {
    waiting: ['called', 'skipped', 'cancelled'],
    called: ['in_progress', 'skipped', 'cancelled'],
    in_progress: ['completed', 'paused', 'cancelled'],
    completed: [], // Final state
    cancelled: [], // Final state
    skipped: ['in_progress', 'cancelled'],
    paused: ['in_progress', 'cancelled']
  }

  return validTransitions[from]?.includes(to) || false
}

export function calculateWaitTime(createdAt: Date, calledAt?: Date): number {
  const endTime = calledAt || new Date()
  return Math.floor((endTime.getTime() - createdAt.getTime()) / 1000 / 60) // minutes
}

export function calculateServiceTime(calledAt?: Date, completedAt?: Date): number {
  if (!calledAt || !completedAt) return 0
  return Math.floor((completedAt.getTime() - calledAt.getTime()) / 1000 / 60) // minutes
}

export function generateTicketNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  
  const letter1 = letters[Math.floor(Math.random() * letters.length)]
  const letter2 = letters[Math.floor(Math.random() * letters.length)]
  const number1 = numbers[Math.floor(Math.random() * numbers.length)]
  const number2 = numbers[Math.floor(Math.random() * numbers.length)]
  
  return `${letter1}${letter2}${number1}${number2}`
}

export function getPriorityColor(priority: TicketPriority): string {
  switch (priority) {
    case 'priority': return 'text-red-600 bg-red-50'
    case 'normal': return 'text-blue-600 bg-blue-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case 'waiting': return 'text-blue-600 bg-blue-50'
    case 'called': return 'text-orange-600 bg-orange-50'
    case 'in_progress': return 'text-purple-600 bg-purple-50'
    case 'completed': return 'text-green-600 bg-green-50'
    case 'cancelled': return 'text-red-600 bg-red-50'
    case 'skipped': return 'text-yellow-600 bg-yellow-50'
    case 'paused': return 'text-gray-600 bg-gray-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusText(status: TicketStatus): string {
  switch (status) {
    case 'waiting': return 'En Espera'
    case 'called': return 'Llamado'
    case 'in_progress': return 'En Atención'
    case 'completed': return 'Completado'
    case 'cancelled': return 'Cancelado'
    case 'skipped': return 'Saltado'
    case 'paused': return 'Pausado'
    default: return 'Desconocido'
  }
}

export function sortTicketsByPriority(tickets: Ticket[]): Ticket[] {
  return tickets.sort((a, b) => {
    // Priority tickets first
    if (a.priority === 'priority' && b.priority === 'normal') return -1
    if (a.priority === 'normal' && b.priority === 'priority') return 1
    
    // Then by position
    return a.position - b.position
  })
}

export function estimateTicketWaitTime(position: number, averageServiceTime: number): number {
  if (position <= 0 || averageServiceTime <= 0) return 0
  return Math.round(position * averageServiceTime)
}
