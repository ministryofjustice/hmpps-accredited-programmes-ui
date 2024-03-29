import type { RequestHandler } from 'express'

import { ApplicationRoles } from './roleBasedAccessMiddleware'
import logger from '../../logger'
import type { UserService } from '../services'
import { UserUtils } from '../utils'

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const { token: userToken } = res.locals.user
        req.session.user ||= await userService.getCurrentUserWithDetails(userToken)

        const activeCaseLoadId = req.session.user?.caseloads.find(caseload => caseload.currentlyActive)?.caseLoadId

        if (req.session.user) {
          const roles = UserUtils.getUserRolesFromToken(userToken)
          res.locals.user = {
            ...res.locals.user,
            ...req.session.user,
            activeCaseLoadId,
            hasReferrerRole: roles?.includes(ApplicationRoles.ACP_REFERRER),
            roles,
          }
        } else {
          logger.info('No user available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve user for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
