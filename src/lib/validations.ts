import { z } from 'zod'

// Validaciones de autenticación
export const workerLoginSchema = z.object({
  username: z.string().min(1, 'Nombre de usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const userRegisterSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export const userLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

// Validaciones de colas
export const selectQueueSchema = z.object({
  queueId: z.string().min(1, 'ID de cola requerido'),
})

export const joinQueueSchema = z.object({
  pushToken: z.string().optional(),
  serviceType: z.string().optional(),
  priority: z.enum(['normal', 'priority']).optional(),
  notes: z.string().optional(),
})

// Validaciones de tickets
export const callCustomerSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
})

export const finishAttentionSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
  notes: z.string().optional(),
  serviceRating: z.number().min(1).max(5).optional(),
})

export const skipTurnSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
  reason: z.string().optional(),
})

export const cancelTicketSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
  reason: z.string().min(1, 'Razón de cancelación requerida'),
})

export const togglePauseSchema = z.object({
  isPaused: z.boolean(),
})

export const selectSkippedTicketSchema = z.object({
  ticketNumber: z.string().min(1, 'Número de ticket requerido'),
})

// Validaciones de perfil
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  profilePicture: z.string().optional(),
})

export const pushTokenSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  platform: z.enum(['ios', 'android']),
})

// Validaciones de parámetros de URL
export const tenantParamSchema = z.object({
  tenantId: z.string().min(1),
})

export const queueParamSchema = z.object({
  queueId: z.string().min(1),
})

export const ticketParamSchema = z.object({
  ticketId: z.string().min(1),
})

export const companyParamSchema = z.object({
  companyId: z.string().min(1),
})

// Validaciones de query parameters
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  ...paginationQuerySchema.shape,
})

export const ticketsQuerySchema = z.object({
  status: z.enum(['waiting', 'called', 'in_progress', 'completed', 'cancelled', 'paused']).optional(),
  ...paginationQuerySchema.shape,
})
