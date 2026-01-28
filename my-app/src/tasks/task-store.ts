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
  }

  list(): Task[] {
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
    return this.tasks.delete(id)
  }
}

export const taskStore = new TaskStore()
