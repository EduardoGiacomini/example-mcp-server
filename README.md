# example-mcp-server

A minimal [Model Context Protocol](https://modelcontextprotocol.io) server that manages a todo list.
It speaks MCP over Streamable HTTP (stateless mode) and keeps todos in memory, so they are lost
when the process stops.

## Requirements

- Node.js 22.18+ (or 23.6+). The server runs the `.ts` files directly with Node's built-in type
  stripping - there is no build step. Tested on Node 24.
- npm

## Install

```sh
npm install
```

## Run

```sh
npm start
```

The server listens on `http://localhost:3999/mcp` and prints `example-mcp-server on 3999`.
Stop it with `Ctrl+C`.

Port and auth token are hardcoded in `index.ts`:

| Setting    | Value        |
| ---------- | ------------ |
| Port       | `3999`       |
| Auth token | `secret-123` |

Every request must send `Authorization: Bearer secret-123`; otherwise the server answers
`401 {"error":"unauthorized"}`.
