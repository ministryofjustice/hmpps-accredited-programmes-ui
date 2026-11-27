import { Router } from 'express'

import { Auth } from '../authentication'
import { tokenVerificationClient } from '../data'
import type { Services } from '../services'
import populateCurrentUser from './populateCurrentUser'

export default function setUpCurrentUser({ userService }: Services): Router {
  const router = Router({ mergeParams: true })
  router.use(Auth.authenticationMiddleware(tokenVerificationClient))
  router.use(populateCurrentUser(userService))
  return router
}
