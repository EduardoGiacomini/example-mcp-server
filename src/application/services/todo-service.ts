import type { Todo } from '@/domain/index.ts'
import { TodoNotFoundError } from '@/domain/errors/index.ts'
import type {
  CreateTodoParams,
  ITodoRepository,
  UpdateTodoParams
} from '@/application/ports/index.ts'

export interface ListTodosPage {
  pageNumber?: number
  pageSize?: number
}

export class TodoService {
  private readonly todoRepository: ITodoRepository

  constructor ({ todoRepository }: { todoRepository: ITodoRepository }) {
    this.todoRepository = todoRepository
  }

  create (params: CreateTodoParams): Promise<Todo> {
    return this.todoRepository.create(params)
  }

  list ({ pageNumber = 0, pageSize = 20 }: ListTodosPage = {}): Promise<Todo[]> {
    return this.todoRepository.list({ limit: pageSize, offset: pageNumber * pageSize })
  }

  async update (todoId: string, params: UpdateTodoParams): Promise<Todo> {
    const todo = await this.todoRepository.update(todoId, params)
    if (!todo) throw new TodoNotFoundError(todoId)
    return todo
  }

  async delete (todoId: string): Promise<void> {
    const todo = await this.todoRepository.find(todoId)
    if (!todo) throw new TodoNotFoundError(todoId)
    await this.todoRepository.delete(todoId)
  }
}
