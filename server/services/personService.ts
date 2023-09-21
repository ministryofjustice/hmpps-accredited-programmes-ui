import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { PrisonerClient, RestClientBuilder } from '../data'
import { PersonUtils } from '../utils'
import type { Person } from '@accredited-programmes/models'

export default class PersonService {
  constructor(private readonly prisonerClientBuilder: RestClientBuilder<PrisonerClient>) {}

  async getPerson(token: Express.User['token'], prisonNumber: string): Promise<Person | null> {
    const prisonerClient = this.prisonerClientBuilder(token)

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
