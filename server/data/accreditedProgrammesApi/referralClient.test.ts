import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import ReferralClient from './referralClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import { referralFactory, referralSummaryFactory } from '../../testutils/factories'
import type { CreatedReferralResponse, Paginated, ReferralSummary, ReferralUpdate } from '@accredited-programmes/models'

pactWith({ consumer: 'Accredited Programmes UI', provider: 'Accredited Programmes API' }, provider => {
  let referralClient: ReferralClient

  const userToken = 'token-1'

  beforeEach(() => {
    referralClient = new ReferralClient(userToken)
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
            authorization: `Bearer ${userToken}`,
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
            authorization: `Bearer ${userToken}`,
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

  describe('findReferralSummaries', () => {
    const organisationId = 'a026cc07-8e0b-40dd-9b66-1b3dacecc63d'
    const paginatedReferralSummaries: Paginated<ReferralSummary> = {
      content: referralSummaryFactory.buildList(2),
      pageIsEmpty: false,
      pageNumber: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
    }

    describe('without query parameters', () => {
      beforeEach(() => {
        provider.addInteraction({
          state: `Referral summaries exist for an organisation with the ID ${organisationId}`,
          uponReceiving: `A request for the summaries for an organisation with the ID ${organisationId}`,
          willRespondWith: {
            body: Matchers.like(paginatedReferralSummaries),
            status: 200,
          },
          withRequest: {
            headers: {
              authorization: `Bearer ${userToken}`,
            },
            method: 'GET',
            path: apiPaths.referrals.dashboard({ organisationId }),
            query: {
              size: '999',
            },
          },
        })
      })

      it('fetches referral summaries for a given organisation ID', async () => {
        const result = await referralClient.findReferralSummaries(organisationId, {})

        expect(result).toEqual(paginatedReferralSummaries)
      })
    })

    describe('with query parameters', () => {
      const query = {
        audience: 'General offence',
        status: 'REFERRAL_SUBMITTED',
      }

      beforeEach(() => {
        provider.addInteraction({
          state: `Referral summaries exist for an organisation with the ID ${organisationId} with query parameters`,
          uponReceiving: `A request for the summaries for an organisation with the ID ${organisationId} with query parameters`,
          willRespondWith: {
            body: Matchers.like(paginatedReferralSummaries),
            status: 200,
          },
          withRequest: {
            headers: {
              authorization: `Bearer ${userToken}`,
            },
            method: 'GET',
            path: apiPaths.referrals.dashboard({ organisationId }),
            query: {
              ...query,
              size: '999',
            },
          },
        })
      })

      it('fetches referral summaries for a given organisation ID with specified query parameters', async () => {
        const result = await referralClient.findReferralSummaries(organisationId, query)

        expect(result).toEqual(paginatedReferralSummaries)
      })
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
            authorization: `Bearer ${userToken}`,
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
            authorization: `Bearer ${userToken}`,
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
            authorization: `Bearer ${userToken}`,
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
