import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'

const actions = (router: Router) => {
  return {
    get: (path: string | Array<string>, handler: RequestHandler) => router.get(path, asyncMiddleware(handler)),
    post: (path: string | Array<string>, handler: RequestHandler) => router.post(path, asyncMiddleware(handler)),
  }
}

export default { actions }
