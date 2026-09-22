import { asClass, asValue, createContainer, InjectionMode } from 'awilix'
import type { ITodoRepository } from '@/application/ports/index.ts'
import { MemoryTodoRepository } from '@/adapters/out/repositories/memory/index.ts'
import { TodoService } from '@/application/services/index.ts'
import { HttpMcpServer, type IMcpServer, type McpServerConfig } from '@/adapters/in/mcp/server/index.ts'
import type { IMcpTools } from '@/adapters/in/mcp/tools/index.ts'
import { TodoMcpTools, TodoOutputMapper } from '@/adapters/in/mcp/tools/todo/index.ts'

export interface Cradle {
  mcpServerConfig: McpServerConfig
  todoRepository: ITodoRepository
  todoService: TodoService
  todoOutputMapper: TodoOutputMapper
  mcpTools: IMcpTools
  mcpServer: IMcpServer
}

export function buildContainer (mcpServerConfig: McpServerConfig) {
  const container = createContainer<Cradle>({ injectionMode: InjectionMode.PROXY, strict: true })

  container.register({
    mcpServerConfig: asValue(mcpServerConfig),
    todoRepository: asClass(MemoryTodoRepository).singleton(),
    todoService: asClass(TodoService).singleton(),
    todoOutputMapper: asClass(TodoOutputMapper).singleton(),
    mcpTools: asClass(TodoMcpTools).singleton(),
    mcpServer: asClass(HttpMcpServer).singleton()
  })

  return container
}
