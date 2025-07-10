import { z } from 'zod'

// Schema para login de worker
export const workerLoginSchema = z.object({
  username: z.string().min(1, 'Nombre de usuario requerido').max(100, 'Nombre de usuario muy largo'),
  password: z.string().min(1, 'Contraseña requerida').min(6, 'Contraseña debe tener al menos 6 caracteres')
})

// Schema para validar tokens JWT
export const tokenPayloadSchema = z.object({
  id: z.string(),
  username: z.string(),
  type: z.enum(['worker', 'admin', 'client']),
  tenantId: z.string(),
  role: z.string()
})
