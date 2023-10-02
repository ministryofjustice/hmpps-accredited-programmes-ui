import type { Caseload } from '@prison-api'

export type UserDetails = {
  caseloads: Array<Caseload>
  displayName: string
  name: string
  userId: string
}
