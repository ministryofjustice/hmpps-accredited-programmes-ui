import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { PrisonerClient, RestClientBuilder } from '../data'
import { personUtils } from '../utils'
import type { Person } from '@accredited-programmes/models'

export default class PersonService {
  constructor(private readonly prisonerClientBuilder: RestClientBuilder<PrisonerClient>) {}

  async getPerson(token: string, prisonNumber: string): Promise<Person | null> {
    const prisonerClient = this.prisonerClientBuilder(token)

    try {
      const prisoner = await prisonerClient.getPrisoner(prisonNumber)

      return personUtils.personFromPrisoner(prisoner)
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
