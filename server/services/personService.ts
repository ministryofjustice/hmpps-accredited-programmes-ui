import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { HmppsAuthClient, PrisonerClient, RestClientBuilder, RestClientBuilderWithoutToken } from '../data'
import { PersonUtils } from '../utils'
import type { Person } from '@accredited-programmes/models'

export default class PersonService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly prisonerClientBuilder: RestClientBuilder<PrisonerClient>,
  ) {}

  async getPerson(username: Express.User['username'], prisonNumber: string): Promise<Person | null> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const prisonerClient = this.prisonerClientBuilder(systemToken)

    try {
      const prisoner = await prisonerClient.find(prisonNumber)

      return PersonUtils.personFromPrisoner(prisoner)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        return null
      }

      throw createError(knownError.status || 500, knownError, {
        userMessage: `Error fetching prisoner ${prisonNumber}.`,
      })
    }
  }
}
