import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'GetUserStatus',
  description: 'Get user registration status and details',
  method: 'GET',
  path: '/users/:userId/status',
  flows: ['user-registration'],
  emits: [],
  
  responseSchema: {
    200: z.object({
      userId: z.string(),
      name: z.string(),
      email: z.string(),
      status: z.string(),
      createdAt: z.string(),
      emailSent: z.boolean(),
      accountSetup: z.boolean(),
    }),
    404: z.object({
      error: z.string(),
    }),
  },
}

export const handler: Handlers['GetUserStatus'] = async (req, { logger, state }) => {
  const { userId } = req.pathParams

  logger.info('Fetching user status', { userId })

  // Get user data
  const userData = await state.get('users', userId) as {
    userId: string
    name: string
    email: string
    status: string
    createdAt: string
  } | null

  if (!userData) {
    logger.warn('User not found', { userId })
    return {
      status: 404,
      body: { error: 'User not found' },
    }
  }

  // Check if email was sent
  const emailRecord = await state.get('emails', `welcome-${userId}`)
  const emailSent = !!emailRecord

  // Check if account setup is completed
  const userSettings = await state.get('user-settings', userId)
  const accountSetup = !!userSettings

  logger.info('User status retrieved', { userId, status: userData.status })

  return {
    status: 200,
    body: {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      status: userData.status,
      createdAt: userData.createdAt,
      emailSent,
      accountSetup,
    },
  }
}
