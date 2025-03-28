import authorisationMiddleware from './authorisationMiddleware'
import { ApplicationRoles } from './roleBasedAccessMiddleware'
import setUpAuthentication from './setUpAuthentication'
import setUpCsrf from './setUpCsrf'
import setUpCurrentUser from './setUpCurrentUser'
import setUpEnvironmentName from './setUpEnvironmentName'
import setUpHealthChecks from './setUpHealthChecks'
import setUpSentry from './setUpSentry'
import setUpStaticResources from './setUpStaticResources'
import setUpWebRequestParsing from './setUpWebRequestParsing'
import setUpWebSecurity from './setUpWebSecurity'
import setUpWebSession from './setUpWebSession'

export {
  ApplicationRoles,
  authorisationMiddleware,
  setUpAuthentication,
  setUpCsrf,
  setUpCurrentUser,
  setUpEnvironmentName,
  setUpHealthChecks,
  setUpSentry,
  setUpStaticResources,
  setUpWebRequestParsing,
  setUpWebSecurity,
  setUpWebSession,
}
