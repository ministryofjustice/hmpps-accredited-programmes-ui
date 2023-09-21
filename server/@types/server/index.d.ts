import type { ApplicationRoles } from '../../middleware/roleBasedAccessMiddleware'

export type MiddlewareOptions = {
  allowedRoles?: Array<ApplicationRoles>
}
