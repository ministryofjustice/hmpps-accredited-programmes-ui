/* istanbul ignore file */

import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'

export default class RouteUtils {
  static actions(router: Router) {
    return {
      get: (path: Array<string> | string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler)),
      post: (path: Array<string> | string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler)),
      put: (path: Array<string> | string, handler: RequestHandler) => router.put(path, asyncMiddleware(handler)),
    }
  }
}
