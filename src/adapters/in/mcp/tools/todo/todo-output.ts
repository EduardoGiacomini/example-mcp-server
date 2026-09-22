import { z } from 'zod'
import { todoStatuses, type Todo, type TodoStatus } from '@/domain/index.ts'

export const todoStatusSchema = z.enum(todoStatuses as [TodoStatus, ...TodoStatus[]])

export const todoOutputSchema = z.object({
  id: z.string(),
  description: z.string(),
  status: todoStatusSchema,
  createdDate: z.string().describe('ISO 8601 timestamp')
})

export type TodoOutput = z.infer<typeof todoOutputSchema>

export class TodoOutputMapper {
  toStructuredContent (todo: Todo): TodoOutput {
    return { ...todo, createdDate: todo.createdDate.toISOString() }
  }

  toTextContent (todo: Todo): string {
    return `"${todo.description}" (id: ${todo.id}, status: ${todo.status}, created: ${todo.createdDate.toISOString()})`
  }
}
