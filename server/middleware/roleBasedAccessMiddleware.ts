import type { NextFunction, Request, RequestHandler, Response } from 'express'

import type { ApplicationRoles } from './applicationRoles'
import logger from '../../logger'
import type { MiddlewareOptions } from '@accredited-programmes/users'

export { ApplicationRoles } from './applicationRoles'

export default function roleBasedAccessMiddleware(
  requestHandler: RequestHandler,
  middlewareOptions?: MiddlewareOptions,
) {
  if (middlewareOptions?.allowedRoles) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (res.locals.user.roles.some((role: ApplicationRoles) => middlewareOptions.allowedRoles?.includes(role))) {
        return requestHandler(req, res, next)
      }

      logger.error('User is not authorised to access this')
      return res.redirect('/authError')
    }
  }

  return requestHandler
}
