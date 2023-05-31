import OrganisationService from './organisationService'
import PrisonClient from '../data/prisonClient'
import prisonFactory from '../testutils/factories/prison'

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
    describe('when the prison has a primary address', () => {
      it("returns the specified organisation with the prison's primary address", async () => {
        const prison = prisonFactory.build()
        const primaryAddress = prison.addresses.find(address => address.primary)

        prisonClient.getPrison.mockResolvedValue(prison)

        const result = await service.getOrganisation(token, prison.agencyId)

        expect(result).toEqual({
          id: prison.agencyId,
          name: prison.premise,
          category: 'N/A',
          address: {
            addressLine1: primaryAddress.street,
            town: primaryAddress.town,
            county: primaryAddress.locality,
            postalCode: primaryAddress.postalCode,
            country: primaryAddress.country,
          },
        })

        expect(prisonClientFactory).toHaveBeenCalledWith(token)
        expect(prisonClient.getPrison).toHaveBeenCalledWith(prison.agencyId)
      })
    })

    describe('if for any reason the prison has no primary address', () => {
      it('returns the specified organisation with "Not found" for all address fields', async () => {
        const prison = prisonFactory.build({ addresses: [] })

        prisonClient.getPrison.mockResolvedValue(prison)

        const result = await service.getOrganisation(token, prison.agencyId)

        expect(result).toEqual({
          id: prison.agencyId,
          name: prison.premise,
          category: 'N/A',
          address: {
            addressLine1: 'Not found',
            town: 'Not found',
            county: 'Not found',
            postalCode: 'Not found',
            country: 'Not found',
          },
        })

        expect(prisonClientFactory).toHaveBeenCalledWith(token)
        expect(prisonClient.getPrison).toHaveBeenCalledWith(prison.agencyId)
      })
    })

    describe('if for any reason the prison is not found', () => {
      it('returns `null`', async () => {
        prisonClient.getPrison.mockResolvedValue(null)

        const notFoundPrisonId = 'NOT-FOUND'

        const result = await service.getOrganisation(token, notFoundPrisonId)

        expect(result).toEqual(null)

        expect(prisonClientFactory).toHaveBeenCalledWith(token)
        expect(prisonClient.getPrison).toHaveBeenCalledWith(notFoundPrisonId)
      })
    })
  })
})
