import { z } from 'zod'

// Schema para validar parámetros de tenant
export const tenantParamSchema = z.object({
  tenantId: z.string().min(1, 'ID de tenant requerido').max(50, 'ID de tenant muy largo')
})
