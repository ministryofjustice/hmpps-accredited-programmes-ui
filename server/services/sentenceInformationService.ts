import createError from 'http-errors'
import type { ResponseError } from 'superagent'

import type { RestClientBuilder, SentenceInformationClient } from '../data'
import type { Person } from '@accredited-programmes/models'
import type { SentenceAndOffenceDetails } from '@prison-api'

export default class SentenceInformationService {
  constructor(private readonly sentenceInformationClientBuilder: RestClientBuilder<SentenceInformationClient>) {}

  async getSentenceAndOffenceDetails(
    token: Express.User['token'],
    bookingId: Person['bookingId'],
  ): Promise<SentenceAndOffenceDetails> {
    try {
      const sentenceInformationClient = this.sentenceInformationClientBuilder(token)
      return await sentenceInformationClient.findSentenceAndOffenceDetails(bookingId)
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
