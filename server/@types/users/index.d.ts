import type { ApplicationRoles } from '../../middleware/roleBasedAccessMiddleware'
import type { User } from '@manage-users-api'
import type { Caseload } from '@prison-api'

type MiddlewareOptions = {
  allowedRoles?: Array<ApplicationRoles>
}

type UserDetails = User & {
  caseloads: Array<Caseload>
  displayName: string
}

export type { MiddlewareOptions, UserDetails }
