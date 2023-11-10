import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type {
  HmppsAuthClient,
  PrisonApiClient,
  PrisonerSearchClient,
  RestClientBuilder,
  RestClientBuilderWithoutToken,
} from '../data'
import { PersonUtils } from '../utils'
import type { Person } from '@accredited-programmes/models'
import type { Caseload, OffenderSentenceAndOffences } from '@prison-api'

export default class PersonService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>,
  ) {}

  async getPerson(
    username: Express.User['username'],
    prisonNumber: Person['prisonNumber'],
    caseloads: Array<Caseload>,
  ): Promise<Person> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(systemToken)

    const caseloadIds = caseloads.map(caseload => caseload.caseLoadId)

    try {
      const prisoner = await prisonerSearchClient.find(prisonNumber, caseloadIds)

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

  async getSentenceAndOffenceDetails(
    token: Express.User['token'],
    bookingId: Person['bookingId'],
  ): Promise<OffenderSentenceAndOffences> {
    try {
      const prisonApiClient = this.prisonApiClientBuilder(token)
      return await prisonApiClient.findSentenceAndOffenceDetails(bookingId)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, `Sentence and offence details for booking with ID ${bookingId} not found.`)
      }

      const errorMessage =
        knownError.message === 'Internal Server Error'
          ? `Error fetching sentence and offence details with booking ID ${bookingId}.`
          : knownError.message

      throw createError(knownError.status || 500, errorMessage)
    }
  }
}
