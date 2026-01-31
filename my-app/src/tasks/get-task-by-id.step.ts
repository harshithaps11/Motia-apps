import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { taskStore } from './task-store'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetTaskById',
  description: 'Get a specific task by ID',
  method: 'GET',
  path: '/tasks/:id',
  flows: ['task-management'],
  emits: [],
  
  responseSchema: {
    200: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed']),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
    404: z.object({
      error: z.string(),
    }),
  },
}

export const handler: Handlers['GetTaskById'] = async (req, { logger }) => {
  const taskId = req.pathParams.id
  logger.info('Retrieving task by ID', { taskId })

  const task = taskStore.get(taskId)

  if (!task) {
    logger.warn('Task not found', { taskId })
    return {
      status: 404,
      body: { error: 'Task not found' },
    }
  }

  logger.info('Task retrieved successfully', { taskId })

  return {
    status: 200,
    body: task,
  }
}
