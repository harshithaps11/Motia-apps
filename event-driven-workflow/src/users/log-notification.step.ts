import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'LogNotification',
  description: 'Log all email notifications and store notification history',
  flows: ['user-registration'],
  subscribes: ['email.sent'],
  emits: [],
  
  input: z.object({
    userId: z.string(),
    email: z.string(),
    type: z.string(),
    sentAt: z.string(),
  }),
}

export const handler: Handlers['LogNotification'] = async (input, { logger, state }) => {
  const { userId, email, type, sentAt } = input

  logger.info('Logging notification', { userId, type, email })

  // Create notification log entry
  const notificationLog = {
    userId,
    email,
    type,
    sentAt,
    loggedAt: new Date().toISOString(),
  }

  // Store notification log
  const logId = `${userId}-${type}-${Date.now()}`
  await state.set('notification-logs', logId, notificationLog)

  // Update notification count for user
  const userNotifications = (await state.get('notification-counts', userId) as { count: number } | null) || { count: 0 }
  await state.set('notification-counts', userId, {
    count: userNotifications.count + 1,
    lastNotification: sentAt,
  })

  logger.info('Notification logged successfully', { userId, logId })
}
