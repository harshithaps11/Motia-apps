import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import { taskStore } from './task-store'

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
})

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'UpdateTask',
  description: 'Update a task by ID',
  method: 'PUT',
  path: '/tasks/:id',
  flows: ['task-management'],
  emits: [],
  
  bodySchema: updateTaskSchema,

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

export const handler: Handlers['UpdateTask'] = async (req, { logger }) => {
  const taskId = req.pathParams.id
  logger.info('Updating task', { taskId, body: req.body })

  const updates = updateTaskSchema.parse(req.body)
  const task = taskStore.update(taskId, updates)

  if (!task) {
    logger.warn('Task not found', { taskId })
    return {
      status: 404,
      body: { error: 'Task not found' },
    }
  }

  logger.info('Task updated successfully', { taskId })

  return {
    status: 200,
    body: task,
  }
}
