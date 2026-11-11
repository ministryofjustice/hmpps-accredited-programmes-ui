/* istanbul ignore file */

import { RestClient } from '@ministryofjustice/hmpps-rest-client'

import logger from '../../../logger'
import config from '../../config'
import { apiPaths } from '../../paths'
import type { Organisation } from '@accredited-programmes-api'
import type { SystemToken } from '@hmpps-auth'

export default class OrganisationClient {
  restClient: RestClient

  constructor(private readonly token: SystemToken) {
    this.restClient = new RestClient('organisationClient', config.apis.accreditedProgrammesApi, logger)
  }

  async findOrganisation(organisationCode: string): Promise<Organisation> {
    return (await this.restClient.get(
      {
        path: apiPaths.organisations.show({ organisationCode }),
      },
      this.token,
    )) as Organisation
  }
}
