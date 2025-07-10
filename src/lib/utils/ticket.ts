export function generateTicketNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  
  const letter1 = letters[Math.floor(Math.random() * letters.length)]
  const letter2 = letters[Math.floor(Math.random() * letters.length)]
  const number1 = numbers[Math.floor(Math.random() * numbers.length)]
  const number2 = numbers[Math.floor(Math.random() * numbers.length)]
  
  return `${letter1}${letter2}${number1}${number2}`
}

export function calculateEstimatedWaitTime(position: number, averageServiceTime: number = 5): number {
  return Math.max(0, position * averageServiceTime)
}

export function getTicketStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    waiting: 'En espera',
    called: 'Llamado',
    in_progress: 'En atención',
    completed: 'Completado',
    cancelled: 'Cancelado',
    skipped: 'Saltado',
    paused: 'Pausado'
  }
  
  return messages[status] || 'Estado desconocido'
}

export function isTicketActive(status: string): boolean {
  return ['waiting', 'called', 'paused'].includes(status)
}

export function canTicketBePaused(status: string): boolean {
  return ['waiting', 'called'].includes(status)
}

export function canTicketBeResumed(status: string): boolean {
  return status === 'paused'
}

export function canTicketBeCancelled(status: string): boolean {
  return ['waiting', 'called', 'paused'].includes(status)
}
