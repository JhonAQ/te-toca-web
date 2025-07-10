import { z } from 'zod'

// Schemas para gestión de tickets
export const ticketNumberSchema = z.object({
  ticketNumber: z.string()
    .min(1, 'Número de ticket requerido')
    .max(20, 'Número de ticket muy largo')
    .regex(/^[A-Z0-9]+$/, 'Formato de ticket inválido')
})

export const callCustomerSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido')
})

export const finishAttentionSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
  notes: z.string().max(500, 'Notas muy largas').optional(),
  serviceRating: z.number().min(1).max(5).optional()
})

export const skipTurnSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
  reason: z.string().max(200, 'Razón muy larga').optional()
})

export const cancelTicketSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
  reason: z.string().min(1, 'Razón requerida').max(200, 'Razón muy larga')
})

export const selectSkippedTicketSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido')
})
