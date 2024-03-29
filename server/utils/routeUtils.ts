/* istanbul ignore file */

import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import roleBasedAccessMiddleware from '../middleware/roleBasedAccessMiddleware'
import type { MiddlewareOptions } from '@accredited-programmes/users'

export default class RouteUtils {
  static actions(router: Router, defaultMiddlewareOptions?: MiddlewareOptions) {
    return {
      delete: (path: Array<string> | string, handler: RequestHandler, middlewareOptions = defaultMiddlewareOptions) =>
        router.delete(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
      get: (path: Array<string> | string, handler: RequestHandler, middlewareOptions = defaultMiddlewareOptions) =>
        router.get(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
      post: (path: Array<string> | string, handler: RequestHandler, middlewareOptions = defaultMiddlewareOptions) =>
        router.post(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
      put: (path: Array<string> | string, handler: RequestHandler, middlewareOptions = defaultMiddlewareOptions) =>
        router.put(path, asyncMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions))),
    }
  }
}
