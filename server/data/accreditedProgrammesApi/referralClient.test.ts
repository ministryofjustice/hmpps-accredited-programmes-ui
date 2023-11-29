import { faker } from '@faker-js/faker/locale/en_GB'
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

  describe('create', () => {
    const createdReferralResponse: CreatedReferralResponse = { referralId: faker.string.uuid() }
    const prisonNumber = 'A1234AA'
    const referrerId = faker.string.numeric({ length: 6 })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Offering 790a2dfe-7de5-4504-bb9c-83e6e53a6537 exists',
        uponReceiving: 'A request to create a referral to offering 790a2dfe-7de5-4504-bb9c-83e6e53a6537',
        willRespondWith: {
          body: Matchers.like(createdReferralResponse),
          status: 201,
        },
        withRequest: {
          body: { offeringId: '790a2dfe-7de5-4504-bb9c-83e6e53a6537', prisonNumber, referrerId },
          headers: {
            authorization: `Bearer ${userToken}`,
          },
          method: 'POST',
          path: apiPaths.referrals.create({}),
        },
      })
    })

    it('creates a referral and returns a referral ID wrapper', async () => {
      const result = await referralClient.create('790a2dfe-7de5-4504-bb9c-83e6e53a6537', prisonNumber, referrerId)

      expect(result).toEqual(createdReferralResponse)
    })
  })

  describe('find', () => {
    const referral = referralFactory.build({ id: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa' })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists',
        uponReceiving: 'A request for referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa',
        willRespondWith: {
          body: Matchers.like(referral),
          status: 200,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${userToken}`,
          },
          method: 'GET',
          path: apiPaths.referrals.show({ referralId: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa' }),
        },
      })
    })

    it('fetches the given referral', async () => {
      const result = await referralClient.find('0c46ed09-170b-4c0f-aee8-a24eeaeeddaa')

      expect(result).toEqual(referral)
    })
  })

  describe('findReferralSummaries', () => {
    describe('without query parameters', () => {
      const paginatedReferralSummaries: Paginated<ReferralSummary> = {
        content: referralSummaryFactory.buildList(2),
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: 2,
        totalPages: 1,
      }

      beforeEach(() => {
        provider.addInteraction({
          state: 'Referral(s) exist for organisation BWN',
          uponReceiving: "A request for organisation BWN's referral summaries",
          willRespondWith: {
            body: Matchers.like(paginatedReferralSummaries),
            status: 200,
          },
          withRequest: {
            headers: {
              authorization: `Bearer ${userToken}`,
            },
            method: 'GET',
            path: apiPaths.referrals.dashboard({ organisationId: 'BWN' }),
            query: {
              size: '999',
            },
          },
        })
      })

      it("fetches the given organisation's referral summaries", async () => {
        const result = await referralClient.findReferralSummaries('BWN', {})

        expect(result).toEqual(paginatedReferralSummaries)
      })
    })

    describe('with query parameters', () => {
      const paginatedReferralSummaries: Paginated<ReferralSummary> = {
        content: [referralSummaryFactory.build({ status: 'referral_submitted' })],
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
      }

      beforeEach(() => {
        provider.addInteraction({
          state:
            'Referral(s) exist for organisation BWM with status REFERRAL_SUBMITTED to offerings for courses with audience General offence',
          uponReceiving:
            "A request for organistion BWM's referral summaries with status REFERRAL_SUBMITTED to offerings for courses with audience General offence",
          willRespondWith: {
            body: Matchers.like(paginatedReferralSummaries),
            status: 200,
          },
          withRequest: {
            headers: {
              authorization: `Bearer ${userToken}`,
            },
            method: 'GET',
            path: apiPaths.referrals.dashboard({ organisationId: 'BWM' }),
            query: {
              audience: 'General offence',
              size: '999',
              status: 'REFERRAL_SUBMITTED',
            },
          },
        })
      })

      it("fetches the given organisation's referral summaries matching the given query parameters", async () => {
        const result = await referralClient.findReferralSummaries('BWM', {
          audience: 'General offence',
          status: 'REFERRAL_SUBMITTED',
        })

        expect(result).toEqual(paginatedReferralSummaries)
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status referral_started',
        uponReceiving: 'A request to submit referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa',
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          headers: {
            authorization: `Bearer ${userToken}`,
          },
          method: 'POST',
          path: apiPaths.referrals.submit({ referralId: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa' }),
        },
      })
    })

    it('submits the given referral', async () => {
      await referralClient.submit('0c46ed09-170b-4c0f-aee8-a24eeaeeddaa')
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
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status referral_started',
        uponReceiving: 'A request to update referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa',
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
          path: apiPaths.referrals.update({ referralId: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa' }),
        },
      })
    })

    it('updates the given referral', async () => {
      await referralClient.update('0c46ed09-170b-4c0f-aee8-a24eeaeeddaa', referralUpdate)
    })
  })

  describe('updateStatus', () => {
    const newStatus = 'referral_submitted'

    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status referral_started',
        uponReceiving:
          "A request to update a referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa's status to referral_submitted",
        willRespondWith: {
          status: 204,
        },
        withRequest: {
          body: {
            status: newStatus,
          },
          headers: {
            authorization: `Bearer ${userToken}`,
          },
          method: 'PUT',
          path: apiPaths.referrals.updateStatus({ referralId: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa' }),
        },
      })
    })

    it('updates a referral status', async () => {
      await referralClient.updateStatus('0c46ed09-170b-4c0f-aee8-a24eeaeeddaa', newStatus)
    })
  })
})
