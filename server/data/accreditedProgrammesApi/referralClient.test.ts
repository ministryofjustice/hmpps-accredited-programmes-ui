import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import ReferralClient from './referralClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import { referralFactory } from '../../testutils/factories'
import type { CreatedReferralResponse, ReferralUpdate } from '@accredited-programmes/models'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let referralClient: ReferralClient

  const token = 'token-1'

  beforeEach(() => {
    referralClient = new ReferralClient(token)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  const referral = referralFactory
    .started()
    .build({ id: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa', offeringId: 'be1d407c-3cb5-4c7e-bfee-d104bc79213f' })
  const { offeringId, prisonNumber, referrerId } = referral
  const createdReferralResponse: CreatedReferralResponse = { referralId: referral.id }

  describe('create', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral can be created',
        uponReceiving: 'A request to create a referral',
        willRespondWith: {
          body: Matchers.like(createdReferralResponse),
          status: 201,
        },
        withRequest: {
          body: {
            offeringId,
            prisonNumber,
            referrerId,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'POST',
          path: apiPaths.referrals.create({}),
        },
      })
    })

    it('creates a referral and returns a referral ID wrapper', async () => {
      const result = await referralClient.create(offeringId, prisonNumber, referrerId)

      expect(result).toEqual(createdReferralResponse)
    })
  })

  describe('find', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: `A referral exists with ID ${referral.id}`,
        uponReceiving: `A request for referral "${referral.id}"`,
        willRespondWith: {
          body: Matchers.like(referral),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'GET',
          path: apiPaths.referrals.show({ referralId: referral.id }),
        },
      })
    })

    it('fetches the given referral', async () => {
      const result = await referralClient.find(referral.id)

      expect(result).toEqual(referral)
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral can be submitted',
        uponReceiving: 'A request to submit a referral',
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'POST',
          path: apiPaths.referrals.submit({ referralId: referral.id }),
        },
      })
    })

    it('submits a referral', async () => {
      await referralClient.submit(referral.id)
    })
  })

  describe('update', () => {
    const referralUpdate: ReferralUpdate = {
      additionalInformation: 'Some fascinating information',
      hasReviewedProgrammeHistory: true,
      oasysConfirmed: true,
    }

    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral can be updated',
        uponReceiving: 'A request to update a referral',
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          body: {
            ...referralUpdate,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'PUT',
          path: apiPaths.referrals.update({ referralId: referral.id }),
        },
      })
    })

    it('updates a referral', async () => {
      await referralClient.update(referral.id, referralUpdate)
    })
  })

  describe('updateStatus', () => {
    const status = 'referral_submitted'

    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral status can be updated',
        uponReceiving: 'A request to update a referral status',
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          body: {
            status,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
          method: 'PUT',
          path: apiPaths.referrals.updateStatus({ referralId: referral.id }),
        },
      })
    })

    it('updates a referral status', async () => {
      await referralClient.updateStatus(referral.id, status)
    })
  })
})