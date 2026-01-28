import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { taskStore } from './task-store'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetTasks',
  description: 'Get all tasks',
  method: 'GET',
  path: '/tasks',
  flows: ['task-management'],
  emits: [],
  
  responseSchema: {
    200: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed']),
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
  },
}

export const handler: Handlers['GetTasks'] = async (req, { logger }) => {
  logger.info('Retrieving all tasks')

  const tasks = taskStore.list()

  logger.info('Tasks retrieved successfully', { count: tasks.length })

  return {
    status: 200,
    body: tasks,
  }
}
