import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export interface IMcpTools {
  register (server: McpServer): void
}
