import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import ReferralService from './referralService'
import type { RedisClient } from '../data'
import { HmppsAuthClient, ReferralClient, TokenStore } from '../data'
import { referralFactory, referralSummaryFactory } from '../testutils/factories'
import type { CreatedReferralResponse, ReferralStatus, ReferralUpdate } from '@accredited-programmes/models'

jest.mock('../data/accreditedProgrammesApi/referralClient')
jest.mock('../data/hmppsAuthClient')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'some system token'
const username = 'USERNAME'

describe('ReferralService', () => {
  const referralClient = new ReferralClient(systemToken) as jest.Mocked<ReferralClient>
  const referralClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const service = new ReferralService(hmppsAuthClientBuilder, referralClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    referralClientBuilder.mockReturnValue(referralClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('createReferral', () => {
    it('returns a created referral', async () => {
      const referral = referralFactory.started().build()
      const createdReferralResponse: CreatedReferralResponse = { referralId: referral.id }

      when(referralClient.create)
        .calledWith(referral.offeringId, referral.prisonNumber, referral.referrerId)
        .mockResolvedValue(createdReferralResponse)

      const result = await service.createReferral(
        username,
        referral.offeringId,
        referral.prisonNumber,
        referral.referrerId,
      )

      expect(result).toEqual(createdReferralResponse)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.create).toHaveBeenCalledWith(
        referral.offeringId,
        referral.prisonNumber,
        referral.referrerId,
      )
    })
  })

  describe('getReferral', () => {
    it('returns a given referral', async () => {
      const referral = referralFactory.build()
      when(referralClient.find).calledWith(referral.id).mockResolvedValue(referral)

      const result = await service.getReferral(username, referral.id)

      expect(result).toEqual(referral)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.find).toHaveBeenCalledWith(referral.id)
    })
  })

  describe('getReferralSummaries', () => {
    const organisationId = 'organisation-id'

    it('returns a list of referral summaries for a given organisation', async () => {
      const referralSummaries = referralSummaryFactory.buildList(3)
      const paginatedReferralSummariesResponse = {
        content: referralSummaries,
        pageIsEmpty: false,
        pageNumber: 1,
        pageSize: 10,
        totalElements: referralSummaries.length,
        totalPages: 1,
      }

      when(referralClient.findReferralSummaries)
        .calledWith(organisationId)
        .mockResolvedValue(paginatedReferralSummariesResponse)

      const result = await service.getReferralSummaries(username, organisationId)

      expect(result).toEqual(paginatedReferralSummariesResponse)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findReferralSummaries).toHaveBeenCalledWith(organisationId)
    })
  })

  describe('submitReferral', () => {
    it('asks the client to submit a referral', async () => {
      const referral = referralFactory.submitted().build()

      await service.submitReferral(username, referral.id)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.submit).toHaveBeenCalledWith(referral.id)
    })
  })

  describe('updateReferral', () => {
    it('asks the client to update a referral', async () => {
      const referralId = 'an-ID'
      const referralUpdate: ReferralUpdate = {
        hasReviewedProgrammeHistory: false,
        oasysConfirmed: true,
      }

      await service.updateReferral(username, referralId, referralUpdate)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.update).toHaveBeenCalledWith(referralId, referralUpdate)
    })
  })

  describe('updateReferralStatus', () => {
    it('asks the client to update the referral status', async () => {
      const referralId = 'an-ID'
      const status: ReferralStatus = 'referral_submitted'

      await service.updateReferralStatus(username, referralId, status)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.updateStatus).toHaveBeenCalledWith(referralId, status)
    })
  })
})
