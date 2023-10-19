/* istanbul ignore file */

import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { AuditEventSpec } from '../middleware/auditMiddleware'
import auditMiddleware from '../middleware/auditMiddleware'
import roleBasedAccessMiddleware from '../middleware/roleBasedAccessMiddleware'
import type { AuditService } from '../services'
import type { MiddlewareOptions } from '@accredited-programmes/users'

export default class RouteUtils {
  static actions(router: Router, auditService: AuditService, defaultMiddlewareOptions?: MiddlewareOptions) {
    return {
      delete: (
        path: Array<string> | string,
        handler: RequestHandler,
        auditEventSpec?: AuditEventSpec,
        middlewareOptions = defaultMiddlewareOptions,
      ) =>
        router.delete(
          path,
          asyncMiddleware(
            auditMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions), auditService, auditEventSpec),
          ),
        ),
      get: (
        path: Array<string> | string,
        handler: RequestHandler,
        auditEventSpec?: AuditEventSpec,
        middlewareOptions = defaultMiddlewareOptions,
      ) =>
        router.get(
          path,
          asyncMiddleware(
            auditMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions), auditService, auditEventSpec),
          ),
        ),
      post: (
        path: Array<string> | string,
        handler: RequestHandler,
        auditEventSpec?: AuditEventSpec,
        middlewareOptions = defaultMiddlewareOptions,
      ) =>
        router.post(
          path,
          asyncMiddleware(
            auditMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions), auditService, auditEventSpec),
          ),
        ),
      put: (
        path: Array<string> | string,
        handler: RequestHandler,
        auditEventSpec?: AuditEventSpec,
        middlewareOptions = defaultMiddlewareOptions,
      ) =>
        router.put(
          path,
          asyncMiddleware(
            auditMiddleware(roleBasedAccessMiddleware(handler, middlewareOptions), auditService, auditEventSpec),
          ),
        ),
    }
  }
}
