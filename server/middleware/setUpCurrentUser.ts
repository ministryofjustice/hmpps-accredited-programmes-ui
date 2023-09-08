import { Router } from 'express'

import populateCurrentUser from './populateCurrentUser'
import populateCurrentUserRoles from './populateCurrentUserRoles'
import { Auth } from '../authentication'
import { verifyToken } from '../data'
import type { Services } from '../services'

export default function setUpCurrentUser({ userService }: Services): Router {
  const router = Router({ mergeParams: true })
  router.use(Auth.authenticationMiddleware(verifyToken))
  router.use(populateCurrentUser(userService))
  router.use(populateCurrentUserRoles())
  return router
}
