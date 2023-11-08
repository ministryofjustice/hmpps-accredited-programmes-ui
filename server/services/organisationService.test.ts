import createError from 'http-errors'
import { when } from 'jest-when'

import OrganisationService from './organisationService'
import { PrisonRegisterApiClient } from '../data'
import { prisonFactory } from '../testutils/factories'
import { OrganisationUtils } from '../utils'

jest.mock('../data/prisonRegisterApiClient')

describe('OrganisationService', () => {
  const prisonRegisterApiClient = new PrisonRegisterApiClient('token') as jest.Mocked<PrisonRegisterApiClient>
  const prisonRegisterApiClientBuilder = jest.fn()

  const service = new OrganisationService(prisonRegisterApiClientBuilder)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    prisonRegisterApiClientBuilder.mockReturnValue(prisonRegisterApiClient)
  })

  describe('getOrganisation', () => {
    describe('when the prison client finds the corresponding prison', () => {
      describe("and it's active", () => {
        it('returns the specified organisation', async () => {
          const prison = prisonFactory.build({ categories: ['A'] })
          const prisonAddress = prison.addresses[0]

          prisonRegisterApiClient.find.mockResolvedValue(prison)

          const result = await service.getOrganisation(token, prison.prisonId)

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
            name: prison.prisonName,
          })

          expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(token)
          expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(prison.prisonId)
        })
      })

      describe("and it's inactive", () => {
        it('throws an 404 error', async () => {
          const prison = prisonFactory.build({ active: false })
          prisonRegisterApiClient.find.mockResolvedValue(prison)

          const expectedError = createError(404, `Active organisation with ID ${prison.prisonId} not found.`)
          expect(() => service.getOrganisation(token, prison.prisonId)).rejects.toThrowError(expectedError)

          expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(token)
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
        expect(() => service.getOrganisation(token, notFoundPrisonId)).rejects.toThrowError(expectedError)

        expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(notFoundPrisonId)
      })
    })

    describe('when the prison client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(500)
        prisonRegisterApiClient.find.mockRejectedValue(clientError)

        const prisonId = '04aba287-86ac-4b2c-b98e-048b5eefddbc'

        const expectedError = createError(500, `Error fetching organisation ${prisonId}.`)
        expect(() => service.getOrganisation(token, prisonId)).rejects.toThrowError(expectedError)

        expect(prisonRegisterApiClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonRegisterApiClient.find).toHaveBeenCalledWith(prisonId)
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

      const result = await service.getOrganisations(token, allIds)

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
        expect(() => service.getOrganisations(token, allIds)).rejects.toThrowError(expectedError)
      })
    })
  })
})
