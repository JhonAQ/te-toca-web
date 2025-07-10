import { NextRequest } from 'next/server'
import { WorkerService } from '@/lib/services/worker.service'
import { withWorkerAuth } from '@/lib/middleware/auth'
import { togglePauseSchema } from '@/lib/validations'
import { 
  successResponse, 
  validationErrorResponse,
  internalErrorResponse 
} from '@/lib/utils/response'

export const POST = withWorkerAuth(async (request: NextRequest, worker) => {
  try {
    console.log('⏸️ Toggle pause request from worker:', worker.id)

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = togglePauseSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      return validationErrorResponse(errors)
    }

    const { isPaused } = validation.data

    // Cambiar estado de pausa del worker
    const success = await WorkerService.togglePause(worker.id, isPaused)
    if (!success) {
      return internalErrorResponse('Error al cambiar el estado de pausa')
    }

    console.log('✅ Pause status updated:', isPaused ? 'PAUSED' : 'ACTIVE')

    return successResponse({
      success: true,
      isPaused,
      message: `Estado actualizado exitosamente: ${isPaused ? 'Pausado' : 'Activo'}`
    })

  } catch (error) {
    console.error('❌ Error toggling pause:', error)
    return internalErrorResponse('Error al cambiar el estado de pausa')
  }
})
