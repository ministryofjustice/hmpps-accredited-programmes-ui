import type { OrganisationAddress } from './OrganisationAddress'

export type Organisation = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  address: OrganisationAddress
  category: string
  female: boolean
  name: string
}
