import type { RestClientBuilder } from '../data'
import type PrisonClient from '../data/prisonClient'
import { organisationFromPrison } from '../utils/organisationUtils'
import type { Organisation } from '@accredited-programmes/models'

export default class OrganisationService {
  constructor(private readonly prisonClientFactory: RestClientBuilder<PrisonClient>) {}

  async getOrganisation(token: string, id: string): Promise<Organisation | null> {
    const prisonClient = this.prisonClientFactory(token)
    const prison = await prisonClient.getPrison(id)

    if (!prison) {
      return null
    }

    return organisationFromPrison(id, prison)
  }
}
