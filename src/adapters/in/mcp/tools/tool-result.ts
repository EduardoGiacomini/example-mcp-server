export function toolResult<T extends Record<string, unknown>> (structuredContent: T, message: string) {
  return { content: [{ type: 'text' as const, text: message }], structuredContent }
}

export function toolError (message: string) {
  return { isError: true, content: [{ type: 'text' as const, text: message }] }
}
