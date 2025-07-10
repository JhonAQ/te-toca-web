import { z } from 'zod'

export const togglePauseSchema = z.object({
  isPaused: z.boolean()
})
