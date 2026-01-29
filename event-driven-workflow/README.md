# Event-Driven Workflow with Motia - Complete Tutorial

This is a complete step-by-step guide to building event-driven workflows using the Motia framework. This tutorial demonstrates how to create a user registration system that automatically triggers welcome emails, account setup, and notification logging through events.

## Table of Contents

1. [What is Event-Driven Architecture?](#what-is-event-driven-architecture)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Project Structure](#project-structure)
5. [Implementation Steps](#implementation-steps)
6. [Workflow Visualization](#workflow-visualization)
7. [Testing the Workflow](#testing-the-workflow)
8. [Understanding the Flow](#understanding-the-flow)
9. [Next Steps](#next-steps)

## What is Event-Driven Architecture?

Event-driven architecture is a design pattern where components communicate through events rather than direct function calls. In Motia:

- **API Steps** can **emit events** when something happens
- **Event Steps** **subscribe to events** and process them asynchronously
- This creates **decoupled, scalable workflows** where steps don't need to know about each other

### Benefits:
- ✅ **Decoupled** - Components work independently
- ✅ **Scalable** - Event handlers can process in parallel
- ✅ **Resilient** - Failures in one step don't affect others
- ✅ **Flexible** - Easy to add new event handlers without changing existing code

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Redis** (optional - Motia can use in-memory Redis)

## Installation & Setup

### Step 1: Create a New Motia Project

```bash
# Create a new project
npx motia@latest create event-driven-workflow

# Navigate to your project
cd event-driven-workflow
```

### Step 2: Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000` with the Workbench UI.

## Project Structure

```
event-driven-workflow/
├── src/
│   └── users/                          # User registration workflow
│       ├── register-user.step.ts        # API: Register user & emit event
│       ├── send-welcome-email.step.ts   # Event: Send welcome email
│       ├── setup-account.step.ts        # Event: Setup user account
│       ├── log-notification.step.ts     # Event: Log notifications
│       └── get-user-status.step.ts      # API: Check user status
├── motia.config.ts
├── package.json
└── tsconfig.json
```

## Implementation Steps

### Step 1: Create the User Registration API Endpoint

Create `src/users/register-user.step.ts`:

```typescript
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'RegisterUser',
  description: 'Register a new user and trigger welcome workflow',
  method: 'POST',
  path: '/users/register',
  flows: ['user-registration'],
  emits: ['user.registered'],  // 🔥 This step emits an event
  
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

  const userId = `user-${Date.now()}`
  
  const userData = {
    userId,
    name,
    email,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  await state.set('users', userId, userData)

  // 🔥 Emit event - this triggers all subscribers
  await emit({
    topic: 'user.registered',
    data: { userId, name, email },
  })

  logger.info('User registered successfully', { userId })

  return {
    status: 201,
    body: userData,
  }
}
```

**Key Points:**
- `emits: ['user.registered']` declares what events this step can emit
- `emit()` sends the event to all subscribers
- The API responds immediately - event processing happens asynchronously

### Step 2: Create Welcome Email Event Handler

Create `src/users/send-welcome-email.step.ts`:

```typescript
import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'SendWelcomeEmail',
  description: 'Send welcome email to newly registered users',
  flows: ['user-registration'],
  subscribes: ['user.registered'],  // 🔥 This step listens for events
  emits: ['email.sent'],             // 🔥 And emits another event
  
  input: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
  }),
}

export const handler: Handlers['SendWelcomeEmail'] = async (input, { emit, logger, state }) => {
  const { userId, name, email } = input

  logger.info('Sending welcome email', { userId, email })

  // Simulate sending email
  const emailData = {
    to: email,
    subject: 'Welcome to Our Platform!',
    body: `Hello ${name},\n\nWelcome to our platform!`,
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))

  logger.info('Email sent successfully', { userId, email })

  // Store email record
  await state.set('emails', `welcome-${userId}`, {
    userId,
    email,
    type: 'welcome',
    subject: emailData.subject,
    sentAt: new Date().toISOString(),
  })

  // 🔥 Emit another event
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
```

**Key Points:**
- `type: 'event'` marks this as an event handler
- `subscribes: ['user.registered']` means this runs when that event is emitted
- Event handlers receive the event data as `input`
- Can emit new events to create event chains

### Step 3: Create Account Setup Event Handler

Create `src/users/setup-account.step.ts`:

```typescript
import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'SetupUserAccount',
  description: 'Setup user account with default settings and preferences',
  flows: ['user-registration'],
  subscribes: ['user.registered'],  // 🔥 Same event, different handler
  emits: ['account.setup.completed'],
  
  input: z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
  }),
}

export const handler: Handlers['SetupUserAccount'] = async (input, { emit, logger, state }) => {
  const { userId, name, email } = input

  logger.info('Setting up user account', { userId })

  // Create default settings
  const userSettings = {
    userId,
    theme: 'light',
    notifications: true,
    language: 'en',
    timezone: 'UTC',
  }

  // Create default profile
  const userProfile = {
    userId,
    name,
    email,
    bio: '',
    avatar: 'https://via.placeholder.com/150',
    joinedAt: new Date().toISOString(),
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  // Save to state
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

  await emit({
    topic: 'account.setup.completed',
    data: { userId, settings: userSettings, profile: userProfile },
  })

  logger.info('Account setup workflow completed', { userId })
}
```

**Key Points:**
- Multiple event handlers can subscribe to the same event
- They run **in parallel** asynchronously
- Each handler is independent and can fail without affecting others

### Step 4: Create Notification Logger Event Handler

Create `src/users/log-notification.step.ts`:

```typescript
import { EventConfig, Handlers } from 'motia'
import { z } from 'zod'

export const config: EventConfig = {
  type: 'event',
  name: 'LogNotification',
  description: 'Log all email notifications and store notification history',
  flows: ['user-registration'],
  subscribes: ['email.sent'],  // 🔥 Subscribes to emails sent event
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

  // Create log entry
  const notificationLog = {
    userId,
    email,
    type,
    sentAt,
    loggedAt: new Date().toISOString(),
  }

  // Store log
  const logId = `${userId}-${type}-${Date.now()}`
  await state.set('notification-logs', logId, notificationLog)

  // Update notification count
  const userNotifications = (await state.get('notification-counts', userId)) || { count: 0 }
  await state.set('notification-counts', userId, {
    count: userNotifications.count + 1,
    lastNotification: sentAt,
  })

  logger.info('Notification logged successfully', { userId, logId })
}
```

### Step 5: Create Status Check API Endpoint

Create `src/users/get-user-status.step.ts`:

```typescript
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

  const userData = await state.get('users', userId)

  if (!userData) {
    return {
      status: 404,
      body: { error: 'User not found' },
    }
  }

  // Check workflow completion
  const emailRecord = await state.get('emails', `welcome-${userId}`)
  const userSettings = await state.get('user-settings', userId)

  return {
    status: 200,
    body: {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      status: userData.status,
      createdAt: userData.createdAt,
      emailSent: !!emailRecord,
      accountSetup: !!userSettings,
    },
  }
}
```

## Workflow Visualization

### Event Flow Diagram

```
┌─────────────────────────┐
│  POST /users/register   │
│   (RegisterUser API)    │
└───────────┬─────────────┘
            │ emits: user.registered
            │
            ├──────────────┬──────────────┐
            │              │              │
            ▼              ▼              ▼
┌─────────────────┐ ┌────────────────┐  │
│ SendWelcomeEmail│ │ SetupUserAccount│  │
│   (Event Step)  │ │  (Event Step)  │  │
└────────┬────────┘ └────────┬───────┘  │
         │ emits:            │ emits:    │
         │ email.sent        │ account.  │
         │                   │ setup.    │
         ▼                   │ completed │
┌─────────────────┐          │          │
│ LogNotification │          │          │
│   (Event Step)  │◄─────────┘          │
└─────────────────┘                     │
                                        │
         ┌──────────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ GET /users/:id/status    │
│  (GetUserStatus API)     │
└──────────────────────────┘
```

### Viewing in Workbench

1. Open http://localhost:3000
2. Select **"user-registration"** from the flow dropdown
3. You'll see the visual workflow diagram with:
   - 1 API endpoint that emits events
   - 3 event handlers that subscribe to events
   - 1 API endpoint to check status

## Testing the Workflow

### Step 1: Register a New User

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securepass123"
  }' | jq .
```

**Response:**
```json
{
  "userId": "user-1706435232000",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "status": "pending",
  "createdAt": "2024-01-28T10:30:00.000Z"
}
```

### Step 2: Check User Status (Wait 2-3 seconds)

```bash
curl http://localhost:3000/users/user-1706435232000/status | jq .
```

**Response:**
```json
{
  "userId": "user-1706435232000",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "status": "active",
  "createdAt": "2024-01-28T10:30:00.000Z",
  "emailSent": true,
  "accountSetup": true
}
```

**Notice:**
- Status changed from `"pending"` to `"active"`
- `emailSent` and `accountSetup` are both `true`
- All event handlers completed successfully!

### Step 3: View Logs in Workbench

1. Go to http://localhost:3000
2. Click the **"Logs"** tab
3. You'll see log entries from:
   - RegisterUser (API called)
   - SendWelcomeEmail (Event processed)
   - SetupUserAccount (Event processed)
   - LogNotification (Event processed)

## Understanding the Flow

### Event Emission
```typescript
// In RegisterUser API step
await emit({
  topic: 'user.registered',  // Event name
  data: { userId, name, email }  // Event payload
})
```

### Event Subscription
```typescript
// In SendWelcomeEmail event step
export const config: EventConfig = {
  subscribes: ['user.registered'],  // Listen for this event
  // ...
}

export const handler = async (input, { emit, logger, state }) => {
  // input contains the event data
  const { userId, name, email } = input
  // Process the event...
}
```

### Event Chaining
Events can trigger other events, creating powerful workflows:
1. `user.registered` → Triggers SendWelcomeEmail and SetupUserAccount
2. `email.sent` → Triggers LogNotification
3. `account.setup.completed` → Could trigger more handlers (optional)

### Parallel Execution
When multiple event handlers subscribe to the same event:
- They run **asynchronously** in parallel
- Failures in one handler don't affect others
- Each handler is independent

## Key Concepts

### 1. Event Topics
- Events are identified by **topic names** (strings)
- Use descriptive names like `user.registered`, `email.sent`
- Follow naming conventions: `resource.action` format

### 2. Event Data
- Events carry **data payloads** (JSON objects)
- Use Zod schemas to validate event data
- Keep event data minimal - only what subscribers need

### 3. Flows Property
```typescript
flows: ['user-registration']
```
- Groups related steps for visualization in Workbench
- Multiple steps with the same flow name appear together
- Helps understand how your system is organized

### 4. State Management
```typescript
await state.set('namespace', 'key', value)
const value = await state.get('namespace', 'key')
```
- State persists data across steps
- Organized by **namespaces** (like 'users', 'emails')
- Perfect for storing workflow state

## Next Steps

### 1. Add More Event Handlers

Create additional handlers for the workflow:

```typescript
// Send admin notification when user registers
export const config: EventConfig = {
  subscribes: ['user.registered'],
  // ...
}
```

### 2. Add Error Handling

Handle failures gracefully:

```typescript
export const handler: Handlers['SendWelcomeEmail'] = async (input, { emit, logger }) => {
  try {
    await sendEmail(input.email)
    await emit({ topic: 'email.sent', data: {...} })
  } catch (error) {
    logger.error('Email failed', { error })
    await emit({ topic: 'email.failed', data: {...} })
  }
}
```

### 3. Add Retry Logic

Configure retries for failed events:

```typescript
export const config: EventConfig = {
  // ...
  infrastructure: {
    queue: {
      type: 'standard',
      maxRetries: 3,
      visibilityTimeout: 60
    }
  }
}
```

### 4. Add Complex Workflows

Chain multiple events:
```
user.registered → email.sent → email.verified → account.activated
```

### 5. Add Monitoring

Subscribe to all events for monitoring:

```typescript
export const config: EventConfig = {
  subscribes: ['*'],  // Subscribe to ALL events
  // ...
}
```

## Common Patterns

### 1. Fan-Out Pattern
One event triggers multiple handlers:
```
user.registered → [SendEmail, SetupAccount, NotifyAdmin, CreateProfile]
```

### 2. Sequential Processing
Events trigger events in sequence:
```
order.created → payment.processed → inventory.updated → shipping.scheduled
```

### 3. Saga Pattern
Coordinate complex transactions:
```
booking.started → [flight.reserved, hotel.reserved, car.reserved] → booking.confirmed
```

## Resources

- [Motia Documentation](https://motia.dev/docs)
- [Event-Driven Architecture Guide](https://motia.dev/docs/concepts/event-driven)
- [Workbench Guide](https://motia.dev/docs/concepts/workbench)
- [State Management](https://motia.dev/docs/concepts/state)

## Troubleshooting

### Events not triggering
- Verify `emits` array includes the event topic
- Check `subscribes` array matches the emitted topic
- Look for errors in the Logs tab in Workbench

### State not persisting
- Ensure Redis is running (or use in-memory server)
- Check namespace and key names are correct
- Use unique keys to avoid conflicts

### Workflow not completing
- Check event handler logs for errors
- Use the Tracing tab to follow event flow
- Add more logging to debug

---

## Summary

You've successfully built an event-driven workflow with Motia! You learned:

✅ How to emit events from API steps  
✅ How to create event handlers that subscribe to events  
✅ How to chain events to create complex workflows  
✅ How to use state to persist data across steps  
✅ How to visualize workflows in the Workbench  
✅ How to test event-driven systems  
✅ Common event-driven patterns and best practices  

Event-driven architecture makes your applications more scalable, resilient, and maintainable!
