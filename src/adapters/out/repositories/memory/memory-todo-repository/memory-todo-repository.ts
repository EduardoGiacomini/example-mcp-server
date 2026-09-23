import { randomUUID } from 'node:crypto'
import type { Todo } from '@/domain/index.ts'
import type {
  CreateTodoParams,
  ITodoRepository,
  ListTodosParams,
  UpdateTodoParams
} from '@/application/ports/index.ts'

export class MemoryTodoRepository implements ITodoRepository {
  private readonly todos: Todo[] = []

  async create (params: CreateTodoParams): Promise<Todo> {
    const todo: Todo = {
      id: randomUUID(),
      description: params.description,
      status: params.status,
      createdDate: new Date()
    }
    this.todos.push(todo)
    return structuredClone(todo)
  }

  async find (todoId: string): Promise<Todo | null> {
    const todo = this.todos.find(t => t.id === todoId)
    return todo ? structuredClone(todo) : null
  }

  async list (params: ListTodosParams = {}): Promise<Todo[]> {
    const { limit = 20, offset = 0 } = params
    return this.todos
      .slice(offset, offset + limit)
      .map(todo => structuredClone(todo))
  }

  async update (todoId: string, params: UpdateTodoParams): Promise<Todo | null> {
    const todo = this.todos.find(t => t.id === todoId)
    if (!todo) {
      return null
    }

    if (params.description !== undefined) {
      todo.description = params.description
    }
    if (params.status !== undefined) {
      todo.status = params.status
    }

    return structuredClone(todo)
  }

  async delete (todoId: string): Promise<void> {
    const index = this.todos.findIndex(t => t.id === todoId)
    if (index !== -1) {
      this.todos.splice(index, 1)
    }
  }
}
