import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import PersonService from './personService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, PrisonApiClient, PrisonerSearchClient, TokenStore } from '../data'
import {
  caseloadFactory,
  offenceDtoFactory,
  offenceHistoryDetailFactory,
  offenderSentenceAndOffencesFactory,
  personFactory,
  prisonerFactory,
} from '../testutils/factories'
import { PersonUtils } from '../utils'
import type { InmateDetail } from '@prison-api'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonApiClient')
jest.mock('../data/accreditedProgrammesApi/prisonerSearchClient')
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
  const prisonerNumber = 'A1234AA'

  beforeEach(() => {
    jest.resetAllMocks()

    prisonerSearchClientBuilder.mockReturnValue(prisonerSearchClient)
    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    prisonApiClientBuilder.mockReturnValue(prisonApiClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)

    service = new PersonService(hmppsAuthClientBuilder, prisonApiClientBuilder, prisonerSearchClientBuilder)
  })

  describe('getOffenceHistory', () => {
    it('returns the index offence and sorted additional offences for a given booking with additional details about each offence', async () => {
      const indexOffenceHistoryDetail = offenceHistoryDetailFactory.build({
        mostSerious: true,
        offenceCode: 'O2',
        offenceDate: '2023-02-02',
      })
      const indexOffenceDto = offenceDtoFactory.build({ code: 'O2' })

      const firstAdditionalOffenceHistoryDetail = offenceHistoryDetailFactory.build({
        mostSerious: false,
        offenceCode: 'O1',
        offenceDate: '2023-01-01',
      })
      const firstAdditionalOffenceDto = offenceDtoFactory.build({ code: 'O1' })

      const secondAdditionalOffenceHistoryDetail = offenceHistoryDetailFactory.build({
        mostSerious: false,
        offenceCode: 'O3',
        offenceDate: '2023-03-03',
      })
      const secondAdditionalOffenceDto = offenceDtoFactory.build({ code: 'O3' })

      const thirdAdditionalOffenceHistoryDetail = offenceHistoryDetailFactory.build({
        mostSerious: false,
        offenceCode: 'O4',
        offenceDate: undefined,
      })

      const offenderWithOffenceHistory: InmateDetail = {
        offenceHistory: [
          firstAdditionalOffenceHistoryDetail,
          secondAdditionalOffenceHistoryDetail,
          thirdAdditionalOffenceHistoryDetail,
          indexOffenceHistoryDetail,
        ],
      }

      when(prisonApiClient.findOffenderBookingByOffenderNo)
        .calledWith(prisonerNumber)
        .mockResolvedValue(offenderWithOffenceHistory)

      when(prisonApiClient.findOffencesThatStartWith)
        .calledWith('O1')
        .mockResolvedValue({ content: [firstAdditionalOffenceDto] })
        .calledWith('O2')
        .mockResolvedValue({ content: [indexOffenceDto] })
        .calledWith('O3')
        .mockResolvedValue({ content: [secondAdditionalOffenceDto] })
        .calledWith('04')
        .mockResolvedValue({ content: [] })

      const result = await service.getOffenceHistory(username, prisonerNumber)

      expect(result).toEqual({
        additionalOffences: [
          {
            code: secondAdditionalOffenceDto.code,
            date: secondAdditionalOffenceHistoryDetail.offenceDate,
            description: secondAdditionalOffenceDto.description,
            mostSerious: secondAdditionalOffenceHistoryDetail.mostSerious,
            statuteCodeDescription: secondAdditionalOffenceDto.statuteCode.description,
          },
          {
            code: firstAdditionalOffenceHistoryDetail.offenceCode,
            date: firstAdditionalOffenceHistoryDetail.offenceDate,
            description: firstAdditionalOffenceDto.description,
            mostSerious: firstAdditionalOffenceHistoryDetail.mostSerious,
            statuteCodeDescription: firstAdditionalOffenceDto.statuteCode.description,
          },
          {
            code: thirdAdditionalOffenceHistoryDetail.offenceCode,
            date: thirdAdditionalOffenceHistoryDetail.offenceDate,
            description: undefined,
            mostSerious: thirdAdditionalOffenceHistoryDetail.mostSerious,
            statuteCodeDescription: undefined,
          },
        ],
        indexOffence: {
          code: indexOffenceDto.code,
          date: indexOffenceHistoryDetail.offenceDate,
          description: indexOffenceDto.description,
          mostSerious: indexOffenceHistoryDetail.mostSerious,
          statuteCodeDescription: indexOffenceDto.statuteCode?.description,
        },
      })

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
      expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
    })

    describe('when the prison api client does not find any offence history', () => {
      it('throws a 404', async () => {
        const offenderWithNoOffenceHistory: InmateDetail = {}

        when(prisonApiClient.findOffenderBookingByOffenderNo)
          .calledWith(prisonerNumber)
          .mockResolvedValue(offenderWithNoOffenceHistory)

        const expectedError = createError(404, `Offence history for prisoner ${prisonerNumber} not found.`)
        await expect(() => service.getOffenceHistory(systemToken, prisonerNumber)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findOffenderBookingByOffenderNo).toHaveBeenCalledWith(prisonerNumber)
      })
    })

    describe('when the prison api client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        prisonApiClient.findOffenderBookingByOffenderNo.mockRejectedValue(clientError)

        const expectedError = createError(404, `Offence history for prisoner ${prisonerNumber} not found.`)
        await expect(() => service.getOffenceHistory(systemToken, prisonerNumber)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findOffenderBookingByOffenderNo).toHaveBeenCalledWith(prisonerNumber)
      })
    })

    describe('when the prison api client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonApiClient.findOffenderBookingByOffenderNo.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching offence history for prisoner ${prisonerNumber}.`)
        await expect(() => service.getOffenceHistory(systemToken, prisonerNumber)).rejects.toThrowError(expectedError)

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findOffenderBookingByOffenderNo).toHaveBeenCalledWith(prisonerNumber)
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

  describe('getOffenderSentenceAndOffences', () => {
    it('returns sentence and offence details for a given booking', async () => {
      const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build()

      when(prisonApiClient.findSentenceAndOffenceDetails)
        .calledWith(bookingId)
        .mockResolvedValue(offenderSentenceAndOffences)

      const result = await service.getOffenderSentenceAndOffences(systemToken, bookingId)

      expect(result).toEqual(offenderSentenceAndOffences)

      expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(prisonApiClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
    })

    describe('when the booking ID is undefined', () => {
      it('throws a 400 error', async () => {
        const expectedError = createError(400, 'No booking ID found: cannot request sentence and offence details.')
        await expect(() => service.getOffenderSentenceAndOffences(systemToken, undefined)).rejects.toThrowError(
          expectedError,
        )
      })
    })

    describe('when the sentence details client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        prisonApiClient.findSentenceAndOffenceDetails.mockRejectedValue(clientError)

        const expectedError = createError(
          404,
          `Sentence and offence details for booking with ID ${bookingId} not found.`,
        )
        await expect(() => service.getOffenderSentenceAndOffences(systemToken, bookingId)).rejects.toThrowError(
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
        await expect(() => service.getOffenderSentenceAndOffences(systemToken, bookingId)).rejects.toThrowError(
          expectedError,
        )

        expect(prisonApiClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(prisonApiClient.findSentenceAndOffenceDetails).toHaveBeenCalledWith(bookingId)
      })
    })
  })
})
