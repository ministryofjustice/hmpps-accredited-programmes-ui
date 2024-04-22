import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type {
  HmppsAuthClient,
  PersonClient,
  PrisonApiClient,
  RestClientBuilder,
  RestClientBuilderWithoutToken,
} from '../data'
import { PersonUtils } from '../utils'
import type { Person, SentenceDetails } from '@accredited-programmes/models'
import type { OffenceDetails, OffenceHistory } from '@accredited-programmes/ui'
import type { Caseload, OffenderSentenceAndOffences } from '@prison-api'

export default class PersonService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilderWithoutToken<HmppsAuthClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personClientBuilder: RestClientBuilder<PersonClient>,
  ) {}

  async getOffenceHistory(
    username: Express.User['username'],
    prisonNumber: Person['prisonNumber'],
  ): Promise<OffenceHistory> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)

    try {
      const prisonApiClient = this.prisonApiClientBuilder(systemToken)

      const offenderBooking = await prisonApiClient.findOffenderBookingByOffenderNo(prisonNumber)

      if (!offenderBooking.offenceHistory) {
        throw createError(404)
      }

      const offenceHistoryWithDetail: Array<OffenceDetails> = await Promise.all(
        offenderBooking.offenceHistory.map(async offence => {
          const offencesByCode = offence.offenceCode
            ? await prisonApiClient.findOffencesThatStartWith(offence.offenceCode)
            : undefined
          const offenceDetail = offencesByCode?.content?.[0]

          return {
            code: offence.offenceCode,
            date: offence.offenceDate,
            description: offenceDetail?.description,
            mostSerious: offence.mostSerious,
            statuteCodeDescription: offenceDetail?.statuteCode?.description,
          }
        }),
      )

      return {
        additionalOffences: offenceHistoryWithDetail
          .filter(offence => !offence.mostSerious)
          .sort((a, b) => {
            if (!a.date) return 1

            if (!b.date) return -1

            return b.date.localeCompare(a.date)
          }),
        indexOffence: offenceHistoryWithDetail.find(offence => offence.mostSerious),
      }
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(knownError.status, `Offence history for prisoner ${prisonNumber} not found.`)
      }

      const errorMessage =
        knownError.message === 'Internal Server Error'
          ? `Error fetching offence history for prisoner ${prisonNumber}.`
          : knownError.message

      throw createError(knownError.status || 500, errorMessage)
    }
  }

  async getOffenderSentenceAndOffences(
    username: Express.User['username'],
    bookingId: Person['bookingId'],
  ): Promise<OffenderSentenceAndOffences> {
    try {
      if (!bookingId) {
        throw createError(400, 'No booking ID found: cannot request sentence and offence details.')
      }

      const hmppsAuthClient = this.hmppsAuthClientBuilder()
      const systemToken = await hmppsAuthClient.getSystemClientToken(username)
      const prisonApiClient = this.prisonApiClientBuilder(systemToken)

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

  async getPerson(
    username: Express.User['username'],
    prisonNumber: Person['prisonNumber'],
    caseloads: Array<Caseload>,
  ): Promise<Person> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const personClient = this.personClientBuilder(systemToken)

    const caseloadIds = caseloads.map(caseload => caseload.caseLoadId)

    try {
      const prisoner = await personClient.findPrisoner(prisonNumber, caseloadIds)

      if (!prisoner) {
        throw createError(404, `Person with prison number ${prisonNumber} not found.`)
      }

      return PersonUtils.personFromPrisoner(prisoner)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw knownError
      }

      throw createError(knownError.status || 500, knownError, `Error fetching prisoner ${prisonNumber}.`)
    }
  }

  async getSentenceDetails(
    username: Express.User['username'],
    prisonNumber: Person['prisonNumber'],
  ): Promise<SentenceDetails> {
    const hmppsAuthClient = this.hmppsAuthClientBuilder()
    const systemToken = await hmppsAuthClient.getSystemClientToken(username)
    const personClient = this.personClientBuilder(systemToken)

    try {
      return await personClient.findSentenceDetails(prisonNumber)
    } catch (error) {
      const knownError = error as ResponseError

      if (knownError.status === 404) {
        throw createError(404, `Sentence details for prisoner ${prisonNumber} not found.`)
      }

      const errorMessage =
        knownError.message === 'Internal Server Error'
          ? `Error fetching sentence details for prisoner ${prisonNumber}.`
          : knownError.message

      throw createError(knownError.status || 500, errorMessage)
    }
  }
}
