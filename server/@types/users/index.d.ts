import type { ApplicationRoles } from '../../middleware/roleBasedAccessMiddleware'
import type { Caseload } from '@prison-api'

type MiddlewareOptions = {
  allowedRoles?: Array<ApplicationRoles>
}

type UserDetails = {
  caseloads: Array<Caseload>
  displayName: string
  name: string
  userId: string
}

export type { MiddlewareOptions, UserDetails }
