import { asClass, asValue, createContainer, InjectionMode } from 'awilix'
import type { ITodoRepository } from './interfaces/index.ts'
import { InMemoryTodoRepository } from './in-memory/index.ts'
import { TodoService } from './todo-service.ts'
import type { IMcpServer } from './mcp/mcp-server.ts'
import { HttpMcpServer, type McpServerConfig } from './mcp/http-mcp-server.ts'

export interface Cradle {
  mcpServerConfig: McpServerConfig
  todoRepository: ITodoRepository
  todoService: TodoService
  mcpServer: IMcpServer
}

export function buildContainer (mcpServerConfig: McpServerConfig) {
  const container = createContainer<Cradle>({ injectionMode: InjectionMode.PROXY, strict: true })

  container.register({
    mcpServerConfig: asValue(mcpServerConfig),
    todoRepository: asClass(InMemoryTodoRepository).singleton(),
    todoService: asClass(TodoService).singleton(),
    mcpServer: asClass(HttpMcpServer).singleton()
  })

  return container
}
