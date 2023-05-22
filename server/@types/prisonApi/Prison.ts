import type { PrisonAddress } from './PrisonAddress'

export type Prison = {
  agencyId: string
  premise: string
  locality: string
  city: string
  country: string
  addresses: PrisonAddress[]
}
