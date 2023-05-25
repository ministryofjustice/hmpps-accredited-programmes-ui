import type { OrganisationAddress } from './OrganisationAddress'

export type Organisation = {
  id: string
  name: string
  category: string
  address: OrganisationAddress
}
