/* istanbul ignore file */

import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import roleBasedAccessMiddleware from '../middleware/roleBasedAccessMiddleware'
import type { MiddlewareOptions } from '@accredited-programmes/server'

export default class RouteUtils {
  static actions(router: Router) {
    return {
      get: (path: Array<string> | string, handler: RequestHandler, middlewareOptions?: MiddlewareOptions) =>
        router.get(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
      post: (path: Array<string> | string, handler: RequestHandler, middlewareOptions?: MiddlewareOptions) =>
        router.post(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
      put: (path: Array<string> | string, handler: RequestHandler, middlewareOptions?: MiddlewareOptions) =>
        router.put(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
    }
  }
}
