import { createMock } from '@golevelup/ts-jest'
import createError from 'http-errors'
import { when } from 'jest-when'

import OrganisationService from './organisationService'
import { HmppsAuthClient, type RedisClient } from '../data'
import { OrganisationClient, PrisonRegisterApiClient, TokenStore } from '../data'
import { prisonFactory } from '../testutils/factories'
import { OrganisationUtils } from '../utils'
import type { Organisation } from '@accredited-programmes-api'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/prisonRegisterApiClient')
jest.mock('../data/accreditedProgrammesApi/organisationClient')

describe('OrganisationService', () => {
  const redisClient = createMock<RedisClient>({})
  const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
  const username = 'USERNAME'
  const systemToken = 'system-token'
  const userToken = 'token'

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const organisationClient = new OrganisationClient(systemToken) as jest.Mocked<OrganisationClient>
  const organisationClientBuilder = jest.fn()

  const prisonRegisterApiClient = new PrisonRegisterApiClient(userToken) as jest.Mocked<PrisonRegisterApiClient>
  const prisonRegisterApiClientBuilder = jest.fn()

  const service = new OrganisationService(
    hmppsAuthClientBuilder,
    organisationClientBuilder,
    prisonRegisterApiClientBuilder,
  )

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    organisationClientBuilder.mockReturnValue(organisationClient)
    prisonRegisterApiClientBuilder.mockReturnValue(prisonRegisterApiClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('getAllOrganisations', () => {
    it('returns all organisations', async () => {
      const prisons = prisonFactory.buildList(3)
      prisonRegisterApiClient.all.mockResolvedValue(prisons)

      const result = await service.getAllOrganisations(userToken)

      expect(result).toEqual(prisons)

      expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(userToken)
      expect(prisonRegisterApiClient.all).toHaveBeenCalled()
    })

    describe('when the prison client throws an error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonRegisterApiClient.all.mockRejectedValue(clientError)

        const expectedError = createError(500, 'Error fetching organisations.')
        expect(() => service.getAllOrganisations(userToken)).rejects.toThrowError(expectedError)

        expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(userToken)
        expect(prisonRegisterApiClient.all).toHaveBeenCalled()
      })
    })
  })

  describe('getOrganisation', () => {
    describe('when the prison client finds the corresponding prison', () => {
      describe("and it's active", () => {
        it('returns the specified organisation', async () => {
          const prison = prisonFactory.build({ categories: ['A'] })
          const prisonAddress = prison.addresses[0]

          prisonRegisterApiClient.find.mockResolvedValue(prison)

          const result = await service.getOrganisation(userToken, prison.prisonId)

          expect(result).toEqual({
            id: prison.prisonId, // eslint-disable-next-line sort-keys
            address: {
              addressLine1: prisonAddress.addressLine1,
              addressLine2: prisonAddress.addressLine2,
              country: prisonAddress.country,
              county: prisonAddress.county,
              postalCode: prisonAddress.postcode,
              town: prisonAddress.town,
            },
            category: 'A',
            female: prison.female,
            name: prison.prisonName,
          })

          expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(userToken)
          expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(prison.prisonId)
        })
      })

      describe("and it's inactive", () => {
        it('throws an 404 error', async () => {
          const prison = prisonFactory.build({ active: false })
          prisonRegisterApiClient.find.mockResolvedValue(prison)

          const expectedError = createError(404, `Active organisation with ID ${prison.prisonId} not found.`)
          expect(() => service.getOrganisation(userToken, prison.prisonId)).rejects.toThrowError(expectedError)

          expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(userToken)
          expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(prison.prisonId)
        })
      })
    })

    describe('when the prison client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        prisonRegisterApiClient.find.mockRejectedValue(clientError)

        const notFoundPrisonId = 'NOT-FOUND'

        const expectedError = createError(404, `Active organisation with ID ${notFoundPrisonId} not found.`)
        expect(() => service.getOrganisation(userToken, notFoundPrisonId)).rejects.toThrowError(expectedError)

        expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(userToken)
        expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(notFoundPrisonId)
      })
    })

    describe('when the prison client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonRegisterApiClient.find.mockRejectedValue(clientError)

        const prisonId = '04aba287-86ac-4b2c-b98e-048b5eefddbc'

        const expectedError = createError(500, `Error fetching organisation ${prisonId}.`)
        expect(() => service.getOrganisation(userToken, prisonId)).rejects.toThrowError(expectedError)

        expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(userToken)
        expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(prisonId)
      })
    })
  })

  describe('getOrganisationFromAcp', () => {
    const organisationCode = 'WTI'

    it('returns the specified organisation', async () => {
      const organisation: Organisation = { code: organisationCode, prisonName: 'Whatton' }
      organisationClient.findOrganisation.mockResolvedValue(organisation)

      const result = await service.getOrganisationFromAcp(username, organisationCode)

      expect(result).toEqual(organisation)

      expect(organisationClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(organisationClient.findOrganisation).toHaveBeenCalledWith(organisationCode)
    })

    describe('when the organisation client throws a 404 error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(404)
        organisationClient.findOrganisation.mockRejectedValue(clientError)

        const expectedError = createError(404, `Organisation with code ${organisationCode} not found.`)
        expect(() => service.getOrganisationFromAcp(username, organisationCode)).rejects.toThrowError(expectedError)
      })
    })

    describe('when the organisation client throws any other error', () => {
      it('re-throws the known error', async () => {
        const clientError = createError(500)
        organisationClient.findOrganisation.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching organisation ${organisationCode}.`)
        expect(() => service.getOrganisationFromAcp(username, organisationCode)).rejects.toThrowError(expectedError)
      })

      it('throws a 500 error for any unknown errors', async () => {
        const clientError = new Error('Any other error')
        organisationClient.findOrganisation.mockRejectedValue(clientError)

        const expectedError = createError(500, `Error fetching organisation ${organisationCode}.`)
        expect(() => service.getOrganisationFromAcp(username, organisationCode)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('getOrganisations', () => {
    const activePrisonIds = ['found-it', 'yep-got-this-one', 'and-this-one-too']
    const activePrisons = activePrisonIds.map(id => prisonFactory.build({ prisonId: id }))
    const inactivePrisonId = 'got-this-one-but-it-is-inactive'
    const inactivePrison = prisonFactory.build({ active: false, prisonId: inactivePrisonId })
    const foundPrisons = [...activePrisons, inactivePrison]

    beforeEach(() => {
      foundPrisons.forEach(prison => {
        when(prisonRegisterApiClient.find).calledWith(prison.prisonId).mockResolvedValue(prison)
      })
    })

    it('returns all found active prisons', async () => {
      const notFoundPrisonId = 'who-is-she'
      const notFoundClientError = createError(404)
      when(prisonRegisterApiClient.find).calledWith(notFoundPrisonId).mockRejectedValue(notFoundClientError)

      const allIds = [...activePrisonIds, inactivePrisonId, notFoundPrisonId]

      const result = await service.getOrganisations(userToken, allIds)

      const activeOrganisations = activePrisons.map(prison => OrganisationUtils.organisationFromPrison(prison))
      expect(result).toEqual(activeOrganisations)

      allIds.forEach(id => {
        expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(id)
      })
    })

    describe('when the prison client throws a non-404 error', () => {
      it('re-throws the error', () => {
        const otherErrorPrisonId = 'lo-siento-no-entiendo'
        const otherError = createError(500)
        when(prisonRegisterApiClient.find).calledWith(otherErrorPrisonId).mockRejectedValue(otherError)

        // const allIds = [...activePrisonIds, inactivePrisonId, otherErrorPrisonId]
        const allIds = [otherErrorPrisonId]

        const expectedError = createError(500, `Error fetching organisation ${otherErrorPrisonId}.`)
        expect(() => service.getOrganisations(userToken, allIds)).rejects.toThrowError(expectedError)
      })
    })
  })
})
