import { buildContainer } from './src/container.ts'

const port = 3999
const container = buildContainer({ port, authToken: 'secret-123' })
const { mcpServer } = container.cradle

await mcpServer.start()
console.log(`example-mcp-server on ${port}`)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await mcpServer.stop()
    process.exit(0)
  })
}
