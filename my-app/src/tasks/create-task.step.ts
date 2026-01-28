import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { taskStore } from './task-store'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'CreateTask',
  description: 'Create a new task',
  method: 'POST',
  path: '/tasks',
  flows: ['task-management'],
  emits: [],
  
  bodySchema: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string(),
    status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  }),

  responseSchema: {
    201: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed']),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  },
}

export const handler: Handlers['CreateTask'] = async (req, { logger }) => {
  logger.info('Creating new task', { body: req.body })

  const newTask = taskStore.create(req.body)

  logger.info('Task created successfully', { taskId: newTask.id })

  return {
    status: 201,
    body: newTask,
  }
}
