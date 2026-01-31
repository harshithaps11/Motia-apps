import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'SetupUserAccount',
  description: 'Setup user account with default settings and preferences',
  flows: ['user-registration'],
  subscribes: ['user.registered'],
  emits: [],  // No further events needed - workflow completes here
  
  input: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
  }),
}

export const handler: Handlers['SetupUserAccount'] = async (input, { emit, logger, state }) => {
  const { userId, name, email } = input

  logger.info('Setting up user account', { userId })

  // Create default user settings
  const userSettings = {
    userId,
    theme: 'light',
    notifications: true,
    language: 'en',
    timezone: 'UTC',
  }

  // Create default user profile
  const userProfile = {
    userId,
    name,
    email,
    bio: '',
    avatar: 'https://via.placeholder.com/150',
    joinedAt: new Date().toISOString(),
  }

  // Simulate account setup operations
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Save settings and profile to state
  await state.set('user-settings', userId, userSettings)
  await state.set('user-profiles', userId, userProfile)

  logger.info('User account setup completed', { userId })

  // Update user status to active
  const userData = await state.get('users', userId)
  if (userData) {
    await state.set('users', userId, {
      ...userData,
      status: 'active',
      updatedAt: new Date().toISOString(),
    })
  }

  logger.info('Account setup workflow completed', { userId })
}
