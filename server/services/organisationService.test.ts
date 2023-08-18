import createError from 'http-errors'

import OrganisationService from './organisationService'
import { PrisonClient } from '../data'
import { prisonFactory } from '../testutils/factories'

jest.mock('../data/prisonClient')

describe('OrganisationService', () => {
  const prisonClient = new PrisonClient('token') as jest.Mocked<PrisonClient>
  const prisonClientBuilder = jest.fn()

  const service = new OrganisationService(prisonClientBuilder)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    prisonClientBuilder.mockReturnValue(prisonClient)
  })

  describe('getOrganisation', () => {
    describe('when the prison client finds the corresponding prison', () => {
      describe("and it's active", () => {
        it('returns the specified organisation', async () => {
          const prison = prisonFactory.build({ categories: ['A'] })
          const prisonAddress = prison.addresses[0]

          prisonClient.getPrison.mockResolvedValue(prison)

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

          expect(prisonClientBuilder).toHaveBeenCalledWith(token)
          expect(prisonClient.getPrison).toHaveBeenCalledWith(prison.prisonId)
        })
      })

      describe("and it's inactive", () => {
        it('returns `null`', async () => {
          const prison = prisonFactory.build({ active: false })
          prisonClient.getPrison.mockResolvedValue(prison)

          const result = await service.getOrganisation(token, prison.prisonId)

          expect(result).toEqual(null)

          expect(prisonClientBuilder).toHaveBeenCalledWith(token)
          expect(prisonClient.getPrison).toHaveBeenCalledWith(prison.prisonId)
        })
      })
    })

    describe('when the prison client throws a 404 error', () => {
      it('returns `null`', async () => {
        const clientError = createError(404)
        prisonClient.getPrison.mockRejectedValue(clientError)

        const notFoundPrisonId = 'NOT-FOUND'

        const result = await service.getOrganisation(token, notFoundPrisonId)

        expect(result).toEqual(null)

        expect(prisonClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonClient.getPrison).toHaveBeenCalledWith(notFoundPrisonId)
      })
    })

    describe('when the prison client throws any other error', () => {
      it('re-throws the error', async () => {
        const clientError = createError(501)
        prisonClient.getPrison.mockRejectedValue(clientError)

        const prisonId = '04aba287-86ac-4b2c-b98e-048b5eefddbc'

        const expectedError = createError(501)

        expect(() => service.getOrganisation(token, prisonId)).rejects.toThrowError(expectedError)

        expect(prisonClientBuilder).toHaveBeenCalledWith(token)
        expect(prisonClient.getPrison).toHaveBeenCalledWith(prisonId)
      })
    })
  })
})
