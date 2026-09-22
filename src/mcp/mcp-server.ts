export interface IMcpServer {
  start (): Promise<void>
  stop (): Promise<void>
}
