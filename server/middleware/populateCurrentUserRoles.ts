import type { RequestHandler } from 'express'

import MiddlewareUtils from './middlewareUtils'

export default function populateCurrentUserRoles(): RequestHandler {
  return async (req, res, next) => {
    const token = res.locals?.user?.token
    if (token) {
      const roles = MiddlewareUtils.getUserRolesFromToken(token)
      res.locals.user = { roles, ...res.locals.user }
    }
    next()
  }
}
