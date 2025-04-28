import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import type { RedisClient } from '../data'
import ReferenceDataService from './referenceDataService'
import { HmppsAuthClient, ReferenceDataClient, TokenStore } from '../data'
import {
  referralStatusCategoryFactory,
  referralStatusReasonFactory,
  referralStatusRefDataFactory,
} from '../testutils/factories'
import type { ReferralStatusUppercase } from '@accredited-programmes/models'

jest.mock('../data/accreditedProgrammesApi/referenceDataClient')
jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'
const referralStatusCode: ReferralStatusUppercase = 'WITHDRAWN'

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
      const categories = referralStatusCategoryFactory.buildList(2, { referralStatusCode })

      when(referenceDataClient.findReferralStatusCodeCategories)
        .calledWith(referralStatusCode)
        .mockResolvedValue(categories)

      const result = await service.getReferralStatusCodeCategories(username, referralStatusCode)

      expect(result).toEqual(categories)
    })
  })

  describe('getReferralStatusCodeData', () => {
    it('should return reference data for the referral status code', async () => {
      const referralStatusRefData = referralStatusRefDataFactory.build()

      when(referenceDataClient.findReferralStatusCodeData)
        .calledWith(referralStatusCode)
        .mockResolvedValue(referralStatusRefData)

      const result = await service.getReferralStatusCodeData(username, referralStatusCode)

      expect(result).toEqual(referralStatusRefData)
    })
  })

  describe('getReferralStatusCodeReasons', () => {
    it('should return referral status code reasons', async () => {
      const categoryCode = 'A'
      const reasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: categoryCode })

      when(referenceDataClient.findReferralStatusCodeReasons)
        .calledWith(categoryCode, referralStatusCode, undefined)
        .mockResolvedValue(reasons)

      const result = await service.getReferralStatusCodeReasons(username, categoryCode, referralStatusCode)

      expect(result).toEqual(reasons)
    })

    describe('with query parameters', () => {
      it('calls the `getReferralStatusCodeReasons` method with those same query parameters', async () => {
        const categoryCode = 'B'
        const reasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: categoryCode })
        const query = { deselectAndKeepOpen: true }

        when(referenceDataClient.findReferralStatusCodeReasons)
          .calledWith(categoryCode, referralStatusCode, query)
          .mockResolvedValue(reasons)

        const result = await service.getReferralStatusCodeReasons(username, categoryCode, referralStatusCode, query)

        expect(result).toEqual(reasons)
      })
    })
  })

  describe('getReferralStatusCodeReasonsWithCategory', () => {
    it('should return referral status code reasons with category', async () => {
      const reasons = referralStatusReasonFactory.buildList(2, { referralCategoryCode: 'C' })

      when(referenceDataClient.findReferralStatusCodeReasonsWithCategory)
        .calledWith(referralStatusCode)
        .mockResolvedValue(reasons)

      const result = await service.getReferralStatusCodeReasonsWithCategory(username, referralStatusCode)

      expect(result).toEqual(reasons)
    })
  })

  describe('getReferralStatuses', () => {
    it('should return referral statuses', async () => {
      const referralStatuses = referralStatusRefDataFactory.buildList(2)

      when(referenceDataClient.findReferralStatuses).mockResolvedValue(referralStatuses)

      const result = await service.getReferralStatuses(username)

      expect(result).toEqual(referralStatuses)
    })
  })
})
