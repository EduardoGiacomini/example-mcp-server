import type {
  CreateTodoParams,
  ITodoRepository,
  Todo,
  UpdateTodoParams
} from './interfaces/index.ts'

export class TodoNotFoundError extends Error {
  constructor (todoId: string) {
    super(`todo ${todoId} not found`)
  }
}

export interface ListTodosPage {
  pageNumber?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 20

export class TodoService {
  private readonly todoRepository: ITodoRepository

  constructor ({ todoRepository }: { todoRepository: ITodoRepository }) {
    this.todoRepository = todoRepository
  }

  create (params: CreateTodoParams): Promise<Todo> {
    return this.todoRepository.create(params)
  }

  list ({ pageNumber = 0, pageSize = DEFAULT_PAGE_SIZE }: ListTodosPage = {}): Promise<Todo[]> {
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
