import authorisationMiddleware from './authorisationMiddleware'
import getFrontendComponents from './getFrontendComponents'
import { ApplicationRoles } from './roleBasedAccessMiddleware'
import setUpAuthentication from './setUpAuthentication'
import setUpCsrf from './setUpCsrf'
import setUpCurrentUser from './setUpCurrentUser'
import setUpEnvironmentName from './setUpEnvironmentName'
import setUpHealthChecks from './setUpHealthChecks'
import { setUpSentryErrorHandler, setUpSentryRequestHandler } from './setUpSentry'
import setUpStaticResources from './setUpStaticResources'
import setUpWebRequestParsing from './setUpWebRequestParsing'
import setUpWebSecurity from './setUpWebSecurity'
import setUpWebSession from './setUpWebSession'

export {
  ApplicationRoles,
  authorisationMiddleware,
  getFrontendComponents,
  setUpAuthentication,
  setUpCsrf,
  setUpCurrentUser,
  setUpEnvironmentName,
  setUpHealthChecks,
  setUpSentryErrorHandler,
  setUpSentryRequestHandler,
  setUpStaticResources,
  setUpWebRequestParsing,
  setUpWebSecurity,
  setUpWebSession,
}
