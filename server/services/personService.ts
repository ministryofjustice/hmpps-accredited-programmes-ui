import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { HmppsAuthClient, PrisonerClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import { PersonUtils } from '../utils'
import type { Person } from '@accredited-programmes/models'
import type { Caseload } from '@prison-api'

export default class PersonService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly prisonerClientBuilder: RestClientBuilder<PrisonerClient>,
  ) {}

  async getPerson(
    username: Express.User['username'],
    prisonNumber: Person['prisonNumber'],
    caseloads: Array<Caseload>,
  ): Promise<Person> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const prisonerClient = this.prisonerClientBuilder(systemToken)

    const caseloadIds = caseloads.map(caseload => caseload.caseLoadId)

    try {
      const prisoner = await prisonerClient.find(prisonNumber, caseloadIds)

      if (!prisoner) {
        throw createError(404, `Person with prison number ${prisonNumber} not found.`)
      }

      return PersonUtils.personFromPrisoner(prisoner)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw knownError
      }

      throw createError(knownError.status || 500, knownError, {
        userMessage: `Error fetching prisoner ${prisonNumber}.`,
      })
    }
  }
}
