import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import OasysService from './oasysService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, OasysClient, TokenStore } from '../data'
import { offenceDetailFactory, roshAnalysisFactory } from '../testutils/factories'

jest.mock('../data/accreditedProgrammesApi/oasysClient')
jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'
const prisonNumber = 'PRISONNUMBER'

describe('OasysService', () => {
  const oasysClient = new OasysClient(systemToken) as jest.Mocked<OasysClient>
  const oasysClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const service = new OasysService(hmppsAuthClientBuilder, oasysClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    oasysClientBuilder.mockReturnValue(oasysClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('getOffenceDetails', () => {
    it('returns offence details for given prison number', async () => {
      const offenceDetails = offenceDetailFactory.build()

      when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockResolvedValue(offenceDetails)

      const result = await service.getOffenceDetails(username, prisonNumber)

      expect(result).toEqual(offenceDetails)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        const notFoundClientError = createError(404)

        when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getOffenceDetails(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws an error', async () => {
        const clientError = createError(500)

        when(oasysClient.findOffenceDetails).calledWith(prisonNumber).mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching offence details for prison number ${prisonNumber}.`)
        await expect(service.getOffenceDetails(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })

  describe('getRoshAnalysis', () => {
    it('returns the ROSH analysis for the given prison number', async () => {
      const roshAnalysis = roshAnalysisFactory.build()

      when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockResolvedValue(roshAnalysis)

      const result = await service.getRoshAnalysis(username, prisonNumber)

      expect(result).toEqual(roshAnalysis)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
    })

    describe('when the oasys client throws a 404 error', () => {
      it('returns null', async () => {
        const notFoundClientError = createError(404)

        when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockRejectedValue(notFoundClientError)

        const result = await service.getRoshAnalysis(username, prisonNumber)
        expect(result).toBeNull()

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
      })
    })

    describe('when the oasys client throws an unknown error', () => {
      it('throws an error', async () => {
        const clientError = createError(500)

        when(oasysClient.findRoshAnalysis).calledWith(prisonNumber).mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching ROSH analysis for prison number ${prisonNumber}.`)
        await expect(service.getRoshAnalysis(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(oasysClient.findRoshAnalysis).toHaveBeenCalledWith(prisonNumber)
      })
    })
  })
})
