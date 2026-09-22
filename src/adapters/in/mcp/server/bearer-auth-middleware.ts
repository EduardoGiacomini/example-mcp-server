import type { RequestHandler } from 'express'

export function bearerAuth (token: string): RequestHandler {
  return (req, res, next) => {
    if (req.headers.authorization !== `Bearer ${token}`) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }
    next()
  }
}
