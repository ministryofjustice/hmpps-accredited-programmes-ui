import createError from 'http-errors'

import OrganisationService from './organisationService'
import PrisonClient from '../data/prisonClient'
import { prisonFactory } from '../testutils/factories'

jest.mock('../data/prisonClient')

describe('OrganisationService', () => {
  const prisonClient = new PrisonClient('token') as jest.Mocked<PrisonClient>
  const prisonClientFactory = jest.fn()

  const service = new OrganisationService(prisonClientFactory)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    prisonClientFactory.mockReturnValue(prisonClient)
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
            id: prison.prisonId,
            name: prison.prisonName,
            category: 'A',
            address: {
              addressLine1: prisonAddress.addressLine1,
              addressLine2: prisonAddress.addressLine2,
              town: prisonAddress.town,
              county: prisonAddress.county,
              postalCode: prisonAddress.postcode,
              country: prisonAddress.country,
            },
          })

          expect(prisonClientFactory).toHaveBeenCalledWith(token)
          expect(prisonClient.getPrison).toHaveBeenCalledWith(prison.prisonId)
        })
      })

      describe("and it's inactive", () => {
        it('returns `null`', async () => {
          const prison = prisonFactory.build({ active: false })
          prisonClient.getPrison.mockResolvedValue(prison)

          const result = await service.getOrganisation(token, prison.prisonId)

          expect(result).toEqual(null)

          expect(prisonClientFactory).toHaveBeenCalledWith(token)
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

        expect(prisonClientFactory).toHaveBeenCalledWith(token)
        expect(prisonClient.getPrison).toHaveBeenCalledWith(notFoundPrisonId)
      })
    })
  })
})
