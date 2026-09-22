import type { Server } from 'node:http'
import express, { type Request, type Response } from 'express'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { todoStatuses, type TodoStatus } from '../interfaces/index.ts'
import { TodoNotFoundError, type TodoService } from '../todo-service.ts'
import type { IMcpServer } from './mcp-server.ts'

export interface McpServerConfig {
  port: number
  authToken: string
}

const statusSchema = z.enum(todoStatuses as [TodoStatus, ...TodoStatus[]])

function json (value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }
}

function notFound (error: unknown) {
  if (!(error instanceof TodoNotFoundError)) {
    throw error
  }
  return { isError: true, content: [{ type: 'text' as const, text: error.message }] }
}

export class HttpMcpServer implements IMcpServer {
  private readonly config: McpServerConfig
  private readonly todoService: TodoService
  private httpServer: Server | null = null

  constructor ({ mcpServerConfig, todoService }: { mcpServerConfig: McpServerConfig, todoService: TodoService }) {
    this.config = mcpServerConfig
    this.todoService = todoService
  }

  start (): Promise<void> {
    const app = express()
    app.use(express.json())
    app.post('/mcp', (req, res) => this.handleRequest(req, res))

    return new Promise((resolve, reject) => {
      const httpServer = app.listen(this.config.port, (error?: Error) => {
        if (error) {
          reject(error)
          return
        }
        this.httpServer = httpServer
        resolve()
      })
    })
  }

  stop (): Promise<void> {
    const httpServer = this.httpServer
    if (!httpServer) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      httpServer.close(error => {
        if (error) {
          reject(error)
          return
        }
        this.httpServer = null
        resolve()
      })
    })
  }

  private async handleRequest (req: Request, res: Response): Promise<void> {
    if (req.headers.authorization !== `Bearer ${this.config.authToken}`) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    // Stateless transport: one McpServer per request. Todos persist because todoService is a singleton.
    const server = this.createMcpServer()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => {
      transport.close()
      server.close()
    })
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  }

  private createMcpServer (): McpServer {
    const server = new McpServer({ name: 'example-mcp-server', version: '1.0.0' })

    server.tool(
      'create_todo',
      'Creates a todo',
      { description: z.string().min(1), status: statusSchema.default('todo') },
      async (params) => json(await this.todoService.create(params))
    )

    server.tool(
      'list_todos',
      'Lists todos, oldest first',
      { pageNumber: z.number().int().min(0).optional(), pageSize: z.number().int().min(1).max(100).optional() },
      async (params) => json(await this.todoService.list(params))
    )

    server.tool(
      'update_todo',
      'Updates the description and/or status of a todo',
      { id: z.string(), description: z.string().min(1).optional(), status: statusSchema.optional() },
      async ({ id, ...params }) => {
        try {
          return json(await this.todoService.update(id, params))
        } catch (error) {
          return notFound(error)
        }
      }
    )

    server.tool(
      'delete_todo',
      'Deletes a todo',
      { id: z.string() },
      async ({ id }) => {
        try {
          await this.todoService.delete(id)
          return json({ deleted: id })
        } catch (error) {
          return notFound(error)
        }
      }
    )

    return server
  }
}
