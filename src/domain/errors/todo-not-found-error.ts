export class TodoNotFoundError extends Error {
  constructor (todoId: string) {
    super(`todo ${todoId} not found`)
  }
}
