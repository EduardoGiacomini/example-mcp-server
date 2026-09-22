import type { Todo, TodoStatus } from './todo.ts'

export interface CreateTodoParams {
  description: string
  status: TodoStatus
}

export interface UpdateTodoParams {
  description?: string
  status?: TodoStatus
}

export interface ListTodosParams {
  limit?: number
  offset?: number
}

export interface ITodoRepository {
  create (params: CreateTodoParams): Promise<Todo>
  find (todoId: string): Promise<Todo | null>
  list (params?: ListTodosParams): Promise<Todo[]>
  update (todoId: string, params: UpdateTodoParams): Promise<Todo | null>
  delete (todoId: string): Promise<void>
}
