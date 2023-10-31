import createError from 'http-errors'
import { when } from 'jest-when'

import SentenceInformationService from './sentenceInformationService'
import { SentenceInformationClient } from '../data'
import { sentenceAndOffenceDetailsFactory } from '../testutils/factories'

jest.mock('../data/sentenceInformationClient')

const token = 'token'

describe('SentenceInformationService', () => {
  const sentenceInformationClient = new SentenceInformationClient('token') as jest.Mocked<SentenceInformationClient>
  const sentenceInformationClientBuilder = jest.fn()

  let service: SentenceInformationService

  const bookingId = 'A-BOOKING-ID'

  beforeEach(() => {
    jest.resetAllMocks()
    sentenceInformationClientBuilder.mockReturnValue(sentenceInformationClient)
    service = new SentenceInformationService(sentenceInformationClientBuilder)
  })

  describe('getSentenceAndOffenceDetails', () => {
    it('returns sentence and offence details for a given booking', async () => {
      const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()

      when(sentenceInformationClient.findSentenceAndOffenceDetails)
        .calledWith(bookingId)
        .mockResolvedValue(sentenceAndOffenceDetails)

      const result = await service.getSentenceAndOffenceDetails(token, bookingId)

      expect(result).toEqual(sentenceAndOffenceDetails)

      expect(sentenceInformationClientBuilder).toHaveBeenCalledWith(token)
      expect(sentenceInformationClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
    })

    describe('when the sentence details client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        sentenceInformationClient.findSentenceAndOffenceDetails.mockRejectedValue(clientError)

        const expectedError = createError(
          404,
          `Sentence and offence details for booking with ID ${bookingId} not found.`,
        )
        await expect(() => service.getSentenceAndOffenceDetails(token, bookingId)).rejects.toThrowError(expectedError)

        expect(sentenceInformationClientBuilder).toHaveBeenCalledWith(token)
        expect(sentenceInformationClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
      })
    })

    describe('when the prison client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        sentenceInformationClient.findSentenceAndOffenceDetails.mockRejectedValue(clientError)

        const expectedError = createError(
          500,
          `Error fetching sentence and offence details with booking ID ${bookingId}.`,
        )
        await expect(() => service.getSentenceAndOffenceDetails(token, bookingId)).rejects.toThrowError(expectedError)

        expect(sentenceInformationClientBuilder).toHaveBeenCalledWith(token)
        expect(sentenceInformationClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
      })
    })
  })
})
