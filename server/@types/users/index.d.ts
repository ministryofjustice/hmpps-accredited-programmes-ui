import type { ApplicationRoles } from '../../middleware/roleBasedAccessMiddleware'
import type { Caseload } from '@prison-api'

type MiddlewareOptions = {
  allowedRoles?: Array<ApplicationRoles>
}

type User = {
  active: boolean
  authSource: string
  name: string
  userId: string
  username: string
  activeCaseLoadId?: string
  staffId?: number
  uuid?: string
}

type UserDetails = User & {
  caseloads: Array<Caseload>
  displayName: string
}

export type { MiddlewareOptions, User, UserDetails }
