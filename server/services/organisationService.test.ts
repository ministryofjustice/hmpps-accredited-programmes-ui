import OrganisationService from './organisationService'
import PrisonClient from '../data/prisonClient'
import prisonFactory from '../testutils/factories/prison'

jest.mock('../data/prisonClient')

describe('PrisonService', () => {
  const prisonClient = new PrisonClient('token') as jest.Mocked<PrisonClient>
  const prisonClientFactory = jest.fn()

  const service = new OrganisationService(prisonClientFactory)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    prisonClientFactory.mockReturnValue(prisonClient)
  })

  describe('getPrison', () => {
    it('returns the specified prison', async () => {
      // TODO: this should probably be responsible for wrangling the primary address
      const prison = prisonFactory.build()
      prisonClient.getPrison.mockResolvedValue(prison)

      const result = await service.getOrganisation(token, prison.agencyId)

      expect(result).toEqual(prison)

      expect(prisonClientFactory).toHaveBeenCalledWith(token)
      expect(prisonClient.getPrison).toHaveBeenCalledWith(prison.agencyId)
    })
  })
})
