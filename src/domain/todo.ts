export type TodoStatus = 'todo' | 'doing' | 'done'

export const todoStatuses: readonly TodoStatus[] = ['todo', 'doing', 'done']

export interface Todo {
  id: string
  description: string
  status: TodoStatus
  createdDate: Date
}
