import { Organisation } from '../@types/models/Organisation'
import { RestClientBuilder } from '../data'
import PrisonClient from '../data/prisonClient'

export default class OrganisationService {
  constructor(private readonly prisonClientFactory: RestClientBuilder<PrisonClient>) {}

  async getOrganisation(token: string, agencyId: string): Promise<Organisation> {
    const prisonClient = this.prisonClientFactory(token)
    const prison = await prisonClient.getPrison(agencyId)

    const primaryAddress = prison.addresses.find(address => address.primary)

    return {
      name: prison.premise,
      category: 'Not sure',
      address: {
        addressLine1: primaryAddress.street,
        town: primaryAddress.town,
        county: primaryAddress.locality,
        postalCode: primaryAddress.postalCode,
        country: primaryAddress.country,
      },
    }
  }
}
