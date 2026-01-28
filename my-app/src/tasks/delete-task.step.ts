import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { taskStore } from './task-store'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'DeleteTask',
  description: 'Delete a task by ID',
  method: 'DELETE',
  path: '/tasks/:id',
  flows: ['task-management'],
  emits: [],
  
  responseSchema: {
    404: z.object({
      error: z.string(),
    }),
  },
}

export const handler: Handlers['DeleteTask'] = async (req, { logger }) => {
  const taskId = req.pathParams.id
  logger.info('Deleting task', { taskId })

  const deleted = taskStore.remove(taskId)

  if (!deleted) {
    logger.warn('Task not found', { taskId })
    return {
      status: 404,
      body: { error: 'Task not found' },
    }
  }

  logger.info('Task deleted successfully', { taskId })

  return {
    status: 204,
  }
}
