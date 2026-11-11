import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'

import type { AuthenticationClient } from '../data'
import { PniClient } from '../data'
import PniService from './pniService'
import { pniScoreFactory } from '../testutils/factories'
import Helpers from '../testutils/helpers'

jest.mock('../data/accreditedProgrammesApi/pniClient')

describe('PniService', () => {
  const systemToken = 'some system token'
  const username = 'USERNAME'
  const prisonNumber = 'PRISONNUMBER'

  const hmppsAuthClient = createMock<AuthenticationClient>()
  const hmppsAuthClientBuilder = jest.fn()

  const pniClient = new PniClient(systemToken) as jest.Mocked<PniClient>
  const pniClientBuilder = jest.fn()

  const service = new PniService(hmppsAuthClientBuilder, pniClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    pniClientBuilder.mockReturnValue(pniClient)
    hmppsAuthClient.getToken.mockResolvedValue(systemToken)
  })

  describe('getPni', () => {
    const pniScore = pniScoreFactory.build()
    beforeEach(() => {
      pniClient.findPni.mockResolvedValue(pniScore)
    })
    it('returns the PNI score for the given prison number', async () => {
      const result = await service.getPni(username, prisonNumber)

      expect(result).toEqual(pniScore)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getToken).toHaveBeenCalledWith(username)
      expect(pniClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(pniClient.findPni).toHaveBeenCalledWith(prisonNumber, undefined)
    })

    describe('when there are query params', () => {
      it('passes the query params to the PNI client', async () => {
        await service.getPni(username, prisonNumber, { gender: 'Male', savePNI: true })

        expect(pniClient.findPni).toHaveBeenCalledWith(prisonNumber, { gender: 'Male', savePNI: true })
      })
    })

    describe('when the PNI client throws an error', () => {
      it('returns null when the error status is 404', async () => {
        const clientError = Helpers.createApiError(404)
        pniClient.findPni.mockRejectedValue(clientError)

        const result = await service.getPni(username, prisonNumber)

        expect(result).toBeNull()

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getToken).toHaveBeenCalledWith(username)
        expect(pniClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(pniClient.findPni).toHaveBeenCalledWith(prisonNumber, undefined)
      })

      it('re-throws the error when the status is not 404', async () => {
        const clientError = createError(500)
        pniClient.findPni.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching PNI data for prison number ${prisonNumber}.`)
        await expect(service.getPni(username, prisonNumber)).rejects.toThrow(expectedError)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getToken).toHaveBeenCalledWith(username)
        expect(pniClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(pniClient.findPni).toHaveBeenCalledWith(prisonNumber, undefined)
      })
    })
  })
})
