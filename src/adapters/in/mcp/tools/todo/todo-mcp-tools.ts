import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { TodoNotFoundError } from '@/domain/errors/index.ts'
import type { TodoService } from '@/application/services/index.ts'
import { toolError, toolResult, type IMcpTools } from '@/adapters/in/mcp/tools/index.ts'
import { todoOutputSchema, todoStatusSchema, type TodoOutputMapper } from '@/adapters/in/mcp/tools/todo/todo-output.ts'

export class TodoMcpTools implements IMcpTools {
  private readonly todoService: TodoService
  private readonly todoOutputMapper: TodoOutputMapper

  constructor ({ todoService, todoOutputMapper }: { todoService: TodoService, todoOutputMapper: TodoOutputMapper }) {
    this.todoService = todoService
    this.todoOutputMapper = todoOutputMapper
  }

  register (server: McpServer): void {
    this.registerCreateTodo(server)
    this.registerListTodos(server)
    this.registerUpdateTodo(server)
    this.registerDeleteTodo(server)
  }

  private registerCreateTodo (server: McpServer): void {
    server.registerTool(
      'create_todo',
      {
        description: 'Creates a new todo and returns it (id, description, status, createdDate). ' +
          'Use the returned id to update or delete the todo later.',
        inputSchema: {
          description: z.string().min(1).describe('What needs to be done, e.g. "Buy milk". Must not be empty.'),
          status: todoStatusSchema.default('todo').describe('Initial status: "todo" (not started), "doing" (in progress) or "done". Defaults to "todo".')
        },
        outputSchema: todoOutputSchema.shape
      },
      async (params) => {
        const todo = await this.todoService.create(params)
        const message = `Created todo ${this.todoOutputMapper.toTextContent(todo)}.`
        return toolResult(
          this.todoOutputMapper.toStructuredContent(todo),
          message
        )
      }
    )
  }

  private registerListTodos (server: McpServer): void {
    server.registerTool(
      'list_todos',
      {
        description: 'Lists todos in { todos: [...] }, oldest first, one page at a time. ' +
          'A todos array shorter than pageSize means there are no more pages. ' +
          'Use this to find the id of a todo before calling update_todo or delete_todo.',
        inputSchema: {
          pageNumber: z.number().int().min(0).optional().describe('Zero-based page index: 0 is the first page. Defaults to 0.'),
          pageSize: z.number().int().min(1).max(100).optional().describe('Todos per page, from 1 to 100. Defaults to 20.')
        },
        outputSchema: { todos: z.array(todoOutputSchema) }
      },
      async (params) => {
        const todos = await this.todoService.list(params)
        const message = todos.length === 0
          ? 'No todos found on this page.'
          : [`Found ${todos.length} todo(s):`, ...todos.map(todo => `- ${this.todoOutputMapper.toTextContent(todo)}`)].join('\n')
        return toolResult({ todos: todos.map(todo => this.todoOutputMapper.toStructuredContent(todo)) }, message)
      }
    )
  }

  private registerUpdateTodo (server: McpServer): void {
    server.registerTool(
      'update_todo',
      {
        description: 'Changes the description and/or status of an existing todo and returns the updated todo. ' +
          'Omitted fields are left unchanged. Returns an error if no todo has the given id.',
        inputSchema: {
          id: z.string().describe('Id of the todo to update, as returned by create_todo or list_todos.'),
          description: z.string().min(1).optional().describe('New description. Must not be empty. Omit to keep the current one.'),
          status: todoStatusSchema.optional().describe('New status: "todo" (not started), "doing" (in progress) or "done". Omit to keep the current one.')
        },
        outputSchema: todoOutputSchema.shape
      },
      async ({ id, ...params }) => {
        try {
          const todo = await this.todoService.update(id, params)
          const message = `Updated todo ${this.todoOutputMapper.toTextContent(todo)}.`
          return toolResult(
            this.todoOutputMapper.toStructuredContent(todo),
            message
          )
        } catch (error) {
          if (error instanceof TodoNotFoundError) return toolError(error.message)
          throw error
        }
      }
    )
  }

  private registerDeleteTodo (server: McpServer): void {
    server.registerTool(
      'delete_todo',
      {
        description: 'Permanently deletes a todo. This cannot be undone. ' +
          'Returns { "deleted": id } on success, or an error if no todo has the given id.',
        inputSchema: {
          id: z.string().describe('Id of the todo to delete, as returned by create_todo or list_todos.')
        },
        outputSchema: { deleted: z.string() }
      },
      async ({ id }) => {
        try {
          await this.todoService.delete(id)
          const message = `Deleted todo ${id}.`
          return toolResult({ deleted: id }, message)
        } catch (error) {
          if (error instanceof TodoNotFoundError) return toolError(error.message)
          throw error
        }
      }
    )
  }
}
