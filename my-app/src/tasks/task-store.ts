// Simple in-memory store for tasks
interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}

class TaskStore {
  private tasks: Map<string, Task> = new Map()

  constructor() {
    // Initialize with some sample tasks
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Learn Motia Framework',
        description: 'Get familiar with Motia API endpoints',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Build REST API',
        description: 'Create CRUD endpoints for tasks',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    sampleTasks.forEach((task) => this.tasks.set(task.id, task))
    console.log('[TaskStore] Initialized with', this.tasks.size, 'tasks')
  }

  list(): Task[] {
    console.log('[TaskStore] Listing tasks, current count:', this.tasks.size)
    return Array.from(this.tasks.values())
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      id: Date.now().toString(),
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.tasks.set(newTask.id, newTask)
    console.log('[TaskStore] Task created, new count:', this.tasks.size, 'task:', newTask.id)
    return newTask
  }

  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const task = this.tasks.get(id)
    if (!task) return null

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.tasks.set(id, updatedTask)
    return updatedTask
  }

  remove(id: string): boolean {
    const deleted = this.tasks.delete(id)
    console.log('[TaskStore] Task deleted:', id, 'success:', deleted, 'new count:', this.tasks.size)
    return deleted
  }
}

// Use globalThis to persist store across HMR reloads and module evaluations
// globalThis is the standard way to access global scope in both Node.js and browsers
const STORE_KEY = Symbol.for('motia.taskStore')

// @ts-ignore - Using Symbol.for to create a global registry key
if (!globalThis[STORE_KEY]) {
  console.log('[TaskStore] Creating new singleton instance')
  // @ts-ignore
  globalThis[STORE_KEY] = new TaskStore()
} else {
  console.log('[TaskStore] Reusing existing instance')
}

// @ts-ignore
export const taskStore = globalThis[STORE_KEY] as TaskStore
