import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import ReferralClient from './referralClient'
import config from '../config'
import { apiPaths } from '../paths'
import { referralFactory } from '../testutils/factories'
import type { CreatedReferralResponse } from '@accredited-programmes/models'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let referralClient: ReferralClient

  const token = 'token-1'

  beforeEach(() => {
    referralClient = new ReferralClient(token)
    config.apis.accreditedProgrammesApi.url = provider.mockService.baseUrl
  })

  const referral = referralFactory.build()
  const { offeringId, prisonNumber, referrerId } = referral
  const createdReferralResponse: CreatedReferralResponse = { referralId: referral.id }

  describe('create', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral can be created',
        uponReceiving: 'A request to create a referral',
        willRespondWith: {
          body: Matchers.like(createdReferralResponse),
          status: 200,
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
})
