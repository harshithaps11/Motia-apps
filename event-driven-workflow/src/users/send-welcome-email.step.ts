import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'SendWelcomeEmail',
  description: 'Send welcome email to newly registered users',
  flows: ['user-registration'],
  subscribes: ['user.registered'],
  emits: ['email.sent'],
  
  input: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
  }),
}

export const handler: Handlers['SendWelcomeEmail'] = async (input, { emit, logger, state }) => {
  const { userId, name, email } = input

  logger.info('Sending welcome email', { userId, email })

  // Simulate sending email (in production, use email service like SendGrid, AWS SES, etc.)
  const emailData = {
    to: email,
    subject: 'Welcome to Our Platform!',
    body: `Hello ${name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`,
  }

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  logger.info('Email sent successfully', { userId, email })

  // Store email record in state
  await state.set('emails', `welcome-${userId}`, {
    userId,
    email,
    type: 'welcome',
    subject: emailData.subject,
    sentAt: new Date().toISOString(),
  })

  // Emit event that email was sent
  await emit({
    topic: 'email.sent',
    data: {
      userId,
      email,
      type: 'welcome',
      sentAt: new Date().toISOString(),
    },
  })

  logger.info('Welcome email workflow completed', { userId })
}
