import packageJson from '../package.json' with { type: 'json' }
import { buildContainer } from '@/container.ts'

const port = 3999
const container = buildContainer({
  name: packageJson.name,
  version: packageJson.version,
  port,
  authToken: 'secret-123'
})
const { mcpServer } = container.cradle

await mcpServer.start()
console.log(`${packageJson.name} on ${port}`)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await mcpServer.stop()
    process.exit(0)
  })
}
