# Task Management REST API - CRUD Operations

This folder contains a complete implementation of REST API endpoints with CRUD (Create, Read, Update, Delete) operations for task management, built using the Motia framework.

## API Endpoints

### 1. Create Task
**POST** `/tasks`

Creates a new task.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending"
}
```

**Response (201 Created):**
```json
{
  "id": "1706435232000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "createdAt": "2024-01-28T10:30:00.000Z",
  "updatedAt": "2024-01-28T10:30:00.000Z"
}
```

---

### 2. Get All Tasks
**GET** `/tasks`

Retrieves a list of all tasks.

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "title": "Learn Motia Framework",
    "description": "Get familiar with Motia API endpoints",
    "status": "in-progress",
    "createdAt": "2024-01-28T10:00:00.000Z",
    "updatedAt": "2024-01-28T10:00:00.000Z"
  },
  {
    "id": "2",
    "title": "Build REST API",
    "description": "Create CRUD endpoints for tasks",
    "status": "pending",
    "createdAt": "2024-01-28T10:00:00.000Z",
    "updatedAt": "2024-01-28T10:00:00.000Z"
  }
]
```

---

### 3. Get Task by ID
**GET** `/tasks/:id`

Retrieves a specific task by its ID.

**Response (200 OK):**
```json
{
  "id": "1",
  "title": "Learn Motia Framework",
  "description": "Get familiar with Motia API endpoints",
  "status": "in-progress",
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T10:00:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Task not found"
}
```

---

### 4. Update Task
**PUT** `/tasks/:id`

Updates an existing task. All fields are optional.

**Request Body:**
```json
{
  "title": "Learn Motia Framework - Updated",
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "title": "Learn Motia Framework - Updated",
  "description": "Get familiar with Motia API endpoints",
  "status": "completed",
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T10:35:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Task not found"
}
```

---

### 5. Delete Task
**DELETE** `/tasks/:id`

Deletes a task by its ID.

**Response (204 No Content):**
No body returned on success.

**Response (404 Not Found):**
```json
{
  "error": "Task not found"
}
```

---

## Testing the API

### Using cURL

```bash
# Create a new task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My Task", "description": "Task description", "status": "pending"}'

# Get all tasks
curl http://localhost:3000/tasks

# Get a specific task
curl http://localhost:3000/tasks/1

# Update a task
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete a task
curl -X DELETE http://localhost:3000/tasks/1
```

### Using Motia Workbench

1. Start the development server: `npm run dev`
2. Open http://localhost:3000 in your browser
3. Navigate to the API section in the workbench
4. You'll see all 5 task endpoints listed
5. Click on any endpoint to test it interactively

---

## Implementation Details

### Files Structure

```
src/tasks/
├── task-store.ts           # In-memory data store
├── create-task.step.ts     # POST /tasks
├── get-tasks.step.ts       # GET /tasks
├── get-task-by-id.step.ts  # GET /tasks/:id
├── update-task.step.ts     # PUT /tasks/:id
└── delete-task.step.ts     # DELETE /tasks/:id
```

### Task Schema

```typescript
interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}
```

### Key Features

- ✅ Full CRUD operations
- ✅ Request validation using Zod schemas
- ✅ Type-safe handlers with Motia framework
- ✅ In-memory data store (easily replaceable with a database)
- ✅ Proper HTTP status codes
- ✅ Error handling for not found resources
- ✅ Automatic timestamps (createdAt, updatedAt)
- ✅ Logged operations for observability

---

## Next Steps

To connect this API to a real database:

1. Replace the in-memory `taskStore` with a database client (e.g., Prisma, MongoDB, PostgreSQL)
2. Update the handler functions to use database queries
3. Add authentication and authorization middleware
4. Implement pagination for the list endpoint
5. Add filtering and sorting capabilities

Example with Prisma:

```typescript
// Instead of: const tasks = taskStore.list()
const tasks = await prisma.task.findMany()

// Instead of: const task = taskStore.get(taskId)
const task = await prisma.task.findUnique({ where: { id: taskId } })
```

---

## Resources

- [Motia Documentation](https://motia.dev/docs)
- [REST API Best Practices](https://motia.dev/docs/getting-started/build-your-first-app/creating-your-first-rest-api)
- [Zod Schema Validation](https://zod.dev)
