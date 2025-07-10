import { z } from 'zod'

// Schema para seleccionar cola
export const selectQueueSchema = z.object({
  queueId: z.string()
    .min(1, 'ID de cola requerido')
    .max(50, 'ID de cola muy largo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID de cola contiene caracteres inválidos')
})

// Schema para parámetros de cola
export const queueParamSchema = z.object({
  queueId: z.string().min(1, 'ID de cola requerido')
})

// Schema para estadísticas de cola
export const queueStatsSchema = z.object({
  waitingCount: z.number().min(0),
  averageWaitTime: z.number().min(0),
  totalProcessedToday: z.number().min(0),
  currentOperators: z.number().min(0)
})

// Schema para consultas de estado de cola
export const queueStatusQuerySchema = z.object({
  queueId: z.string().min(1, 'ID de cola requerido')
})

// Schema para obtener siguiente ticket
export const nextTicketSchema = z.object({
  queueId: z.string().min(1, 'ID de cola requerido')
})
