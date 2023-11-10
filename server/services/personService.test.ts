import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import PersonService from './personService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, PrisonApiClient, PrisonerSearchClient, TokenStore } from '../data'
import {
  caseloadFactory,
  offence,
  offenceHistory,
  personFactory,
  prisonerFactory,
  sentenceAndOffenceDetailsFactory,
} from '../testutils/factories'
import { PersonUtils } from '../utils'
import type { InmateDetail } from '@prison-api'

jest.mock('../data/prisonerSearchClient')
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
  const prisonerSearchClient = new PrisonerSearchClient(systemToken) as jest.Mocked<PrisonerSearchClient>
  const prisonerSearchClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const prisonApiClient = new PrisonApiClient(systemToken) as jest.Mocked<PrisonApiClient>
  const prisonApiClientBuilder = jest.fn()

  let service: PersonService

  const bookingId = 'A-BOOKING-ID'
  const prisonerNumber = 'A-PRISONER-NUMBER'

  beforeEach(() => {
    jest.resetAllMocks()

    prisonerSearchClientBuilder.mockReturnValue(prisonerSearchClient)
    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    prisonApiClientBuilder.mockReturnValue(prisonApiClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)

    service = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, prisonerSearchClientBuilder)
  })

  describe('getOffenceHistory', () => {
    it('returns offence history for a given booking', async () => {
      const firstOffence = offenceHistory.build({ offenceCode: 'A1', offenceDate: undefined })
      const secondOffence = offenceHistory.build({ mostSerious: true, offenceCode: 'A2', offenceDate: '2023-02-02' })
      const offenceForSecondOffence = offence.build({ code: 'A2' })
      const thirdOffence = offenceHistory.build({ offenceCode: 'A3', offenceDate: '2023-03-03' })
      const offenceForThirdOffence = offence.build({ code: 'A3' })
      const offenderWithOffenceHistory: InmateDetail = {
        offenceHistory: [firstOffence, secondOffence, thirdOffence],
      }

      when(prisonApiClient.findOffender).calledWith(prisonerNumber).mockResolvedValue(offenderWithOffenceHistory)

      when(prisonApiClient.findOffencesByCode).calledWith('A1').mockResolvedValue({ content: [] })
      when(prisonApiClient.findOffencesByCode)
        .calledWith(offenceForSecondOffence.code)
        .mockResolvedValue({ content: [offenceForSecondOffence] })
      when(prisonApiClient.findOffencesByCode)
        .calledWith(offenceForThirdOffence.code)
        .mockResolvedValue({ content: [offenceForThirdOffence] })

      const result = await service.getOffenceHistory(systemToken, prisonerNumber)

      expect(result).toEqual([
        {
          category: offenceForThirdOffence.statuteCode.description,
          description: offenceForThirdOffence.description,
          mostSerious: thirdOffence.mostSerious,
          offenceCode: offenceForThirdOffence.code,
          offenceDate: thirdOffence.offenceDate,
        },
        {
          category: offenceForSecondOffence.statuteCode.description,
          description: offenceForSecondOffence.description,
          mostSerious: secondOffence.mostSerious,
          offenceCode: offenceForSecondOffence.code,
          offenceDate: secondOffence.offenceDate,
        },
        {
          category: 'Not available',
          description: 'Not available',
          mostSerious: firstOffence.mostSerious,
          offenceCode: 'Not available',
          offenceDate: 'Not available',
        },
      ])

      expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
    })

    describe('when the offence history client does not find any offence history', () => {
      it('throws a 404', async () => {
        const offenderWithNoOffenceHistory: InmateDetail = {}

        when(prisonApiClient.findOffender).calledWith(prisonerNumber).mockResolvedValue(offenderWithNoOffenceHistory)

        const expectedError = createError(404, `Offence history for prisoner ${prisonerNumber} not found.`)
        await expect(() => service.getOffenceHistory(systemToken, prisonerNumber)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findOffender).toHaveBeenCalledWith(prisonerNumber)
      })
    })

    describe('when the prison api client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        prisonApiClient.findOffender.mockRejectedValue(clientError)

        const expectedError = createError(404, `Offence history for prisoner ${prisonerNumber} not found.`)
        await expect(() => service.getOffenceHistory(systemToken, prisonerNumber)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findOffender).toHaveBeenCalledWith(prisonerNumber)
      })
    })

    describe('when the prison client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonApiClient.findOffender.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching offence history for prisoner ${prisonerNumber}.`)
        await expect(() => service.getOffenceHistory(systemToken, prisonerNumber)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findOffender).toHaveBeenCalledWith(prisonerNumber)
      })
    })
  })

  describe('getPerson', () => {
    describe('when the prisoner client finds the corresponding prisoner', () => {
      it('converts the returned object to a Person', async () => {
        const prisoner = prisonerFactory.build()

        const person = personFactory.build()

        prisonerSearchClient.find.mockResolvedValue(prisoner)
        ;(PersonUtils.personFromPrisoner as jest.Mock).mockReturnValue(person)

        const result = await service.getPerson(username, prisoner.prisonerNumber, caseloads)

        expect(result).toEqual(person)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerSearchClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerSearchClient.find).toHaveBeenCalledWith(prisoner.prisonerNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
      })
    })

    describe('when the prisoner client does not find a person in prison', () => {
      it('throws a 404', async () => {
        prisonerSearchClient.find.mockResolvedValue(null)

        const notFoundPrisonNumber = 'NOT-FOUND'

        const expectedError = createError(404, `Person with prison number ${notFoundPrisonNumber} not found.`)
        await expect(() => service.getPerson(username, notFoundPrisonNumber, caseloads)).rejects.toThrowError(
          expectedError,
        )

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerSearchClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerSearchClient.find).toHaveBeenCalledWith(notFoundPrisonNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
      })
    })

    describe('when the prisoner client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonerSearchClient.find.mockRejectedValue(clientError)

        const prisonNumber = 'ABC123'

        const expectedError = createError(500)

        await expect(() => service.getPerson(username, prisonNumber, caseloads)).rejects.toThrowError(expectedError)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
        expect(prisonerSearchClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonerSearchClient.find).toHaveBeenCalledWith(prisonNumber, [
          mdiCaseload.caseLoadId,
          bxiCaseload.caseLoadId,
        ])
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
