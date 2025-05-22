/* istanbul ignore file */
import type { ApiConfig } from '../../config'
import config from '../../config'
import { apiPaths } from '../../paths'
import RestClient from '../restClient'
import type { Organisation } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class OrganisationClient {
  restClient: RestClient

  constructor(systemToken: SystemToken) {
    this.restClient = new RestClient(
      'organisationClient',
      config.apis.accreditedProgrammesApi as ApiConfig,
      systemToken,
    )
  }

  async findOrganisation(organisationCode: string): Promise<Organisation> {
    return (await this.restClient.get({
      path: apiPaths.organisations.show({ organisationCode }),
    })) as Organisation
  }
}
