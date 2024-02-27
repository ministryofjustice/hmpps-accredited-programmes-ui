import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import ReferenceDataService from './referenceDataService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, ReferenceDataClient, TokenStore } from '../data'
import { referralStatusCategoryFactory, referralStatusReasonFactory } from '../testutils/factories'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

jest.mock('../data/accreditedProgrammesApi/referenceDataClient')
jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'

describe('ReferenceDataService', () => {
  const referenceDataClient = new ReferenceDataClient(systemToken) as jest.Mocked<ReferenceDataClient>
  const referenceDataClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const service = new ReferenceDataService(hmppsAuthClientBuilder, referenceDataClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    referenceDataClientBuilder.mockReturnValue(referenceDataClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('getReferralStatusCodeCategories', () => {
    it('should return referral status code categories', async () => {
      const referralStatusCode: ReferralStatusUppercase = 'WITHDRAWN'
      const categories = referralStatusCategoryFactory.buildList(2, { referralStatusCode })

      when(referenceDataClient.findReferralStatusCodeCategories)
        .calledWith(referralStatusCode)
        .mockResolvedValue(categories)

      const result = await service.getReferralStatusCodeCategories(username, referralStatusCode)

      expect(result).toEqual(categories)
    })
  })

  describe('getReferralStatusCodeReasons', () => {
    it('should return referral status code reasons', async () => {
      const referralStatusCode: ReferralStatusUppercase = 'WITHDRAWN'
      const categoryCode = 'A'
      const reasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: categoryCode })

      when(referenceDataClient.findReferralStatusCodeReasons)
        .calledWith(categoryCode, referralStatusCode)
        .mockResolvedValue(reasons)

      const result = await service.getReferralStatusCodeReasons(username, categoryCode, referralStatusCode)

      expect(result).toEqual(reasons)
    })
  })
})
