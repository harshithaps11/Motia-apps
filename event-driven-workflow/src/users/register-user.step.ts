import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RegisterUser',
  description: 'Register a new user and trigger welcome workflow',
  method: 'POST',
  path: '/users/register',
  flows: ['user-registration'],
  emits: ['user.registered'],
  
  bodySchema: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  responseSchema: {
    201: z.object({
      userId: z.string(),
      name: z.string(),
      email: z.string(),
      status: z.string(),
      createdAt: z.string(),
    }),
  },
}

export const handler: Handlers['RegisterUser'] = async (req, { emit, logger, state }) => {
  const { name, email, password } = req.body

  logger.info('Registering new user', { name, email })

  // Create user ID
  const userId = `user-${Date.now()}`

  // Store user data (in production, hash the password!)
  const userData = {
    userId,
    name,
    email,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  // Save to state
  await state.set('users', userId, userData)

  // Emit event to trigger welcome email and account setup
  await emit({
    topic: 'user.registered',
    data: {
      userId,
      name,
      email,
    },
  })

  logger.info('User registered successfully', { userId })

  return {
    status: 201,
    body: userData,
  }
}
