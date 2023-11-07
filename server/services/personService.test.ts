import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import PersonService from './personService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, PrisonApiClient, PrisonerClient, TokenStore } from '../data'
import {
  caseloadFactory,
  personFactory,
  prisonerFactory,
  sentenceAndOffenceDetailsFactory,
} from '../testutils/factories'
import { PersonUtils } from '../utils'

jest.mock('../data/prisonerClient')
jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient')
jest.mock('../utils/personUtils')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'

const mdiCaseload = caseloadFactory.active().build({ caseLoadId: 'MDI' })
const bxiCaseload = caseloadFactory.inactive().build({ caseLoadId: 'BXI' })
const caseloads = [mdiCaseload, bxiCaseload]

describe('PersonService', () => {
  const prisonerClient = new PrisonerClient(systemToken) as jest.Mocked<PrisonerClient>
  const prisonerClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const prisonApiClient = new PrisonApiClient(systemToken) as jest.Mocked<PrisonApiClient>
  const prisonApiClientBuilder = jest.fn()

  let service: PersonService

  const bookingId = 'A-BOOKING-ID'

  beforeEach(() => {
    jest.resetAllMocks()

    prisonerClientBuilder.mockReturnValue(prisonerClient)
    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    prisonApiClientBuilder.mockReturnValue(prisonApiClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)

    service = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, prisonerClientBuilder)
  })

  describe('getPerson', () => {
    describe('when the prisoner client finds the corresponding prisoner', () => {
      it('converts the returned object to a Person', async () => {
        const prisoner = prisonerFactory.build()

        const person = personFactory.build()

        prisonerClient.find.mockResolvedValue(prisoner)
        ;(PersonUtils.personFromPrisoner as jest.Mock).mockReturnValue(person)

        const result = await service.getPerson(username, prisoner.prisonerNumber, caseloads)

        expect(result).toEqual(person)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(prisoner.prisonerNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
      })
    })

    describe('when the prisoner client does not find a person in prison', () => {
      it('throws a 404', async () => {
        prisonerClient.find.mockResolvedValue(null)

        const notFoundPrisonNumber = 'NOT-FOUND'

        const expectedError = createError(404, `Person with prison number ${notFoundPrisonNumber} not found.`)
        await expect(() => service.getPerson(username, notFoundPrisonNumber, caseloads)).rejects.toThrowError(
          expectedError,
        )

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(notFoundPrisonNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
      })
    })

    describe('when the prisoner client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonerClient.find.mockRejectedValue(clientError)

        const prisonNumber = 'ABC123'

        const expectedError = createError(500)

        await expect(() => service.getPerson(username, prisonNumber, caseloads)).rejects.toThrowError(expectedError)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerClient.find).toHaveBeenCalledWith(prisonNumber, [mdiCaseload.caseLoadId, bxiCaseload.caseLoadId])
      })
    })
  })

  describe('getSentenceAndOffenceDetails', () => {
    it('returns sentence and offence details for a given booking', async () => {
      const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()

      when(prisonApiClient.findSentenceAndOffenceDetails)
        .calledWith(bookingId)
        .mockResolvedValue(sentenceAndOffenceDetails)

      const result = await service.getSentenceAndOffenceDetails(systemToken, bookingId)

      expect(result).toEqual(sentenceAndOffenceDetails)

      expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
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
        await expect(() => service.getSentenceAndOffenceDetails(systemToken, bookingId)).rejects.toThrowError(
          expectedError,
        )

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
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
        await expect(() => service.getSentenceAndOffenceDetails(systemToken, bookingId)).rejects.toThrowError(
          expectedError,
        )

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
      })
    })
  })
})
