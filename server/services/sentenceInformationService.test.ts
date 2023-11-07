import createError from 'http-errors'
import { when } from 'jest-when'

import SentenceInformationService from './sentenceInformationService'
import { PrisonApiClient } from '../data'
import { sentenceAndOffenceDetailsFactory } from '../testutils/factories'

jest.mock('../data/prisonApiClient')

const token = 'token'

describe('SentenceInformationService', () => {
  const prisonApiClient = new PrisonApiClient('token') as jest.Mocked<PrisonApiClient>
  const prisonApiClientBuilder = jest.fn()

  let service: SentenceInformationService

  const bookingId = 'A-BOOKING-ID'

  beforeEach(() => {
    jest.resetAllMocks()
    prisonApiClientBuilder.mockReturnValue(prisonApiClient)
    service = new SentenceInformationService(prisonApiClientBuilder)
  })

  describe('getSentenceAndOffenceDetails', () => {
    it('returns sentence and offence details for a given booking', async () => {
      const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()

      when(prisonApiClient.findSentenceAndOffenceDetails)
        .calledWith(bookingId)
        .mockResolvedValue(sentenceAndOffenceDetails)

      const result = await service.getSentenceAndOffenceDetails(token, bookingId)

      expect(result).toEqual(sentenceAndOffenceDetails)

      expect(prisonApiClientBuilder).toHaveBeenCalledWith(token)
      expect(prisonApiClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
    })

    describe('when the sentence details client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        prisonApiClient.findSentenceAndOffenceDetails.mockRejectedValue(clientError)

        const expectedError = createError(
          404,
          `Sentence and offence details for booking with ID ${bookingId} not found.`,
        )
        await expect(() => service.getSentenceAndOffenceDetails(token, bookingId)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonApiClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
      })
    })

    describe('when the prison client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonApiClient.findSentenceAndOffenceDetails.mockRejectedValue(clientError)

        const expectedError = createError(
          500,
          `Error fetching sentence and offence details with booking ID ${bookingId}.`,
        )
        await expect(() => service.getSentenceAndOffenceDetails(token, bookingId)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonApiClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
      })
    })
  })
})
