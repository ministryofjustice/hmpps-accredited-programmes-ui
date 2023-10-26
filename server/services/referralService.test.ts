import { when } from 'jest-when'

import ReferralService from './referralService'
import { ReferralClient } from '../data'
import { referralFactory } from '../testutils/factories'
import type { CreatedReferralResponse, ReferralStatus, ReferralUpdate } from '@accredited-programmes/models'

jest.mock('../data/referralClient')

describe('ReferralService', () => {
  const referralClient = new ReferralClient('token') as jest.Mocked<ReferralClient>
  const referralClientBuilder = jest.fn()

  const service = new ReferralService(referralClientBuilder)

  const token = 'token'

  beforeEach(() => {
    jest.resetAllMocks()
    referralClientBuilder.mockReturnValue(referralClient)
  })

  describe('createReferral', () => {
    it('returns a created referral', async () => {
      const referral = referralFactory.started().build()
      const createdReferralResponse: CreatedReferralResponse = { referralId: referral.id }

      when(referralClient.create)
        .calledWith(referral.offeringId, referral.prisonNumber, referral.referrerId)
        .mockResolvedValue(createdReferralResponse)

      const result = await service.createReferral(
        token,
        referral.offeringId,
        referral.prisonNumber,
        referral.referrerId,
      )

      expect(result).toEqual(createdReferralResponse)

      expect(referralClientBuilder).toHaveBeenCalledWith(token)
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

      const result = await service.getReferral(token, referral.id)

      expect(result).toEqual(referral)

      expect(referralClientBuilder).toHaveBeenCalledWith(token)
      expect(referralClient.find).toHaveBeenCalledWith(referral.id)
    })
  })

  describe('submitReferral', () => {
    it('asks the client to submit a referral', async () => {
      const referral = referralFactory.submitted().build()

      await service.submitReferral(token, referral.id)

      expect(referralClientBuilder).toHaveBeenCalledWith(token)
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

      await service.updateReferral(token, referralId, referralUpdate)

      expect(referralClientBuilder).toHaveBeenCalledWith(token)
      expect(referralClient.update).toHaveBeenCalledWith(referralId, referralUpdate)
    })
  })

  describe('updateReferralStatus', () => {
    it('asks the client to update the referral status', async () => {
      const referralId = 'an-ID'
      const status: ReferralStatus = 'referral_submitted'

      await service.updateReferralStatus(token, referralId, status)

      expect(referralClientBuilder).toHaveBeenCalledWith(token)
      expect(referralClient.updateStatus).toHaveBeenCalledWith(referralId, status)
    })
  })
})
