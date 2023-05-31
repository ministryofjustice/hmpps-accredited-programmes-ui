import type { RestClientBuilder } from '../data'
import type PrisonClient from '../data/prisonClient'
import type { Organisation } from '@accredited-programmes/models'

export default class OrganisationService {
  constructor(private readonly prisonClientFactory: RestClientBuilder<PrisonClient>) {}

  async getOrganisation(token: string, id: string): Promise<Organisation | null> {
    const prisonClient = this.prisonClientFactory(token)
    const prison = await prisonClient.getPrison(id)

    if (!prison) {
      return null
    }

    const primaryAddress = prison.addresses.find(address => address.primary)

    return {
      id,
      name: prison.premise,
      category: 'N/A',
      address: {
        addressLine1: primaryAddress?.street || 'Not found',
        town: primaryAddress?.town || 'Not found',
        county: primaryAddress?.locality || 'Not found',
        postalCode: primaryAddress?.postalCode || 'Not found',
        country: primaryAddress?.country || 'Not found',
      },
    }
  }
}
