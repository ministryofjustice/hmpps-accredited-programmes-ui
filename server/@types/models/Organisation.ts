import type { OrganisationAddress } from './OrganisationAddress'

export type Organisation = {
  address: OrganisationAddress
  category: string
  id: string
  name: string
}
