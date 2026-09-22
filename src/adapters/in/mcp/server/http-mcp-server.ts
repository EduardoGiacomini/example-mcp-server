import type { Server } from 'node:http'
import express, { type Request, type Response } from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { bearerAuth } from '@/adapters/in/mcp/server/bearer-auth-middleware.ts'
import type { IMcpServer } from '@/adapters/in/mcp/server/mcp-server.ts'
import type { IMcpTools } from '@/adapters/in/mcp/tools/index.ts'

export interface McpServerConfig {
  name: string
  version: string
  port: number
  authToken: string
}

export class HttpMcpServer implements IMcpServer {
  private readonly config: McpServerConfig
  private readonly mcpTools: IMcpTools
  private httpServer: Server | null = null

  constructor ({ mcpServerConfig, mcpTools }: { mcpServerConfig: McpServerConfig, mcpTools: IMcpTools }) {
    this.config = mcpServerConfig
    this.mcpTools = mcpTools
  }

  start (): Promise<void> {
    const app = express()
    app.use(express.json())
    app.post('/mcp', bearerAuth(this.config.authToken), (req, res) => this.handleRequest(req, res))

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
    const server = new McpServer({ name: this.config.name, version: this.config.version })
    this.mcpTools.register(server)
    return server
  }
}
