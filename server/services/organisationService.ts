import type { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import createError from 'http-errors'

import type {
  AuthenticationClient,
  OrganisationClient,
  PrisonRegisterApiClient,
  RestClientBuilder,
  RestClientBuilderWithoutToken,
} from '../data'
import { OrganisationUtils, TypeUtils } from '../utils'
import type { Organisation } from '@accredited-programmes/models'
import type { Organisation as AcpOrganisation } from '@accredited-programmes-api'
import type { Prison } from '@prison-register-api'

export default class OrganisationService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<AuthenticationClient>,
    private readonly organisationClientBuilder: RestClientBuilder<OrganisationClient>,
    private readonly prisonRegisterApiClientBuilder: RestClientBuilder<PrisonRegisterApiClient>,
  ) {}

  async getAllOrganisations(userToken: Express.User['token']): Promise<Array<Prison>> {
    const prisonRegisterApiClient = this.prisonRegisterApiClientBuilder(userToken)

    try {
      return await prisonRegisterApiClient.all()
    } catch (error) {
      throw createError(500, 'Error fetching organisations.')
    }
  }

  /*
   * @deprecated and should be removed when no longer used elsewhere in the codebase
   * getOrganisationFromAcp should be used instead
   */
  async getOrganisation(userToken: Express.User['token'], organisationId: Organisation['id']): Promise<Organisation> {
    const prisonRegisterApiClient = this.prisonRegisterApiClientBuilder(userToken)
    const notFoundError = createError(404, `Active organisation with ID ${organisationId} not found.`)

    let prison: Awaited<ReturnType<typeof prisonRegisterApiClient.find>>

    try {
      prison = await prisonRegisterApiClient.find(organisationId)
    } catch (error) {
      const knownError = error as SanitisedError

      if (knownError.responseStatus === 404) {
        throw notFoundError
      }

      const errorMessage =
        knownError.message === 'Internal Server Error'
          ? `Error fetching organisation ${organisationId}.`
          : knownError.message

      throw createError(knownError.responseStatus || 500, errorMessage)
    }

    if (!prison.active) {
      throw notFoundError
    }

    return OrganisationUtils.organisationFromPrison(prison)
  }

  async getOrganisationFromAcp(username: Express.User['username'], organisationCode: string): Promise<AcpOrganisation> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getToken(username)

    const organisationClient = this.organisationClientBuilder(systemToken)

    try {
      return await organisationClient.findOrganisation(organisationCode)
    } catch (error) {
      const knownError = error as SanitisedError

      if (knownError.responseStatus === 404) {
        throw createError(knownError.responseStatus, `Organisation with code ${organisationCode} not found.`)
      }

      throw createError(knownError.responseStatus || 500, `Error fetching organisation ${organisationCode}.`)
    }
  }

  async getOrganisations(
    userToken: Express.User['token'],
    organisationIds: Array<Organisation['id']>,
  ): Promise<Array<Organisation>> {
    const prisonRegisterApiClient = this.prisonRegisterApiClientBuilder(userToken)

    const prisonResults: Array<Prison | null> = await Promise.all(
      organisationIds.map(async organisationId => {
        try {
          return await prisonRegisterApiClient.find(organisationId)
        } catch (error) {
          const knownError = error as SanitisedError

          if (knownError.responseStatus === 404) {
            return null
          }

          throw createError(knownError.responseStatus || 500, `Error fetching organisation ${organisationId}.`)
        }
      }),
    )

    const foundPrisons = prisonResults.filter(TypeUtils.isNotNull<Prison>)

    return foundPrisons
      .filter(prison => prison.active)
      .map(activePrison => OrganisationUtils.organisationFromPrison(activePrison))
  }
}
