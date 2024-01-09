import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import OasysService from './oasysService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, OasysClient, TokenStore } from '../data'
import { offenceDetailFactory, referralFactory } from '../testutils/factories'
import type { OffenceDetail } from '@accredited-programmes/models'

jest.mock('../data/accreditedProgrammesApi/oasysClient')
jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'

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
      const referral = referralFactory.build()
      const offenceDetails: Array<OffenceDetail> = offenceDetailFactory.buildList(3)

      when(oasysClient.findOffenceDetails).calledWith(referral.prisonNumber).mockResolvedValue(offenceDetails)

      const result = await service.getOffenceDetails(username, referral.prisonNumber)

      expect(result).toEqual(offenceDetails)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(oasysClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(oasysClient.findOffenceDetails).toHaveBeenCalledWith(referral.prisonNumber)
    })
  })
})
