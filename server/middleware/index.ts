import authorisationMiddleware from './authorisationMiddleware'
import setUpAuthentication from './setUpAuthentication'
import setUpCsrf from './setUpCsrf'
import setUpCurrentUser from './setUpCurrentUser'
import setUpHealthChecks from './setUpHealthChecks'
import { setUpSentryErrorHandler, setUpSentryRequestHandler } from './setUpSentry'
import setUpStaticResources from './setUpStaticResources'
import setUpWebRequestParsing from './setUpWebRequestParsing'
import setUpWebSecurity from './setUpWebSecurity'
import setUpWebSession from './setUpWebSession'

export {
  authorisationMiddleware,
  setUpAuthentication,
  setUpCsrf,
  setUpCurrentUser,
  setUpHealthChecks,
  setUpSentryErrorHandler,
  setUpSentryRequestHandler,
  setUpStaticResources,
  setUpWebRequestParsing,
  setUpWebSecurity,
  setUpWebSession,
}
