import { faker } from '@faker-js/faker/locale/en_GB'
import { Matchers } from '@pact-foundation/pact'
import { pactWith } from 'jest-pact'

import ReferralClient from './referralClient'
import config from '../../config'
import { apiPaths } from '../../paths'
import { referralFactory, referralSummaryFactory } from '../../testutils/factories'
import FactoryHelpers from '../../testutils/factories/factoryHelpers'
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

    beforeEach(() => {
      provider.addInteraction({
        state: 'Offering 7fffcc6a-11f8-4713-be35-cf5ff1aee517 exists',
        uponReceiving: 'A request to create a referral to offering 7fffcc6a-11f8-4713-be35-cf5ff1aee517',
        willRespondWith: {
          body: Matchers.like(createdReferralResponse),
          status: 201,
        },
        withRequest: {
          body: { offeringId: '7fffcc6a-11f8-4713-be35-cf5ff1aee517', prisonNumber },
          headers: {
            authorization: `Bearer ${userToken}`,
          },
          method: 'POST',
          path: apiPaths.referrals.create({}),
        },
      })
    })

    it('creates a referral and returns a referral ID wrapper', async () => {
      const result = await referralClient.create('7fffcc6a-11f8-4713-be35-cf5ff1aee517', prisonNumber)

      expect(result).toEqual(createdReferralResponse)
    })
  })

  describe('find', () => {
    const referral = referralFactory.started().build({
      id: '0c46ed09-170b-4c0f-aee8-a24eeaeeddaa',
    })

    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status REFERRAL_STARTED',
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
        content: [referralSummaryFactory.build({ status: 'referral_submitted' })],
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: 1,
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
              size: '15',
            },
          },
        })
      })

      it("fetches the given organisation's referral summaries", async () => {
        const result = await referralClient.findReferralSummaries('BWN')

        expect(result).toEqual(paginatedReferralSummaries)
      })
    })

    describe('with query parameters', () => {
      const paginatedReferralSummaries: Paginated<ReferralSummary> = {
        content: FactoryHelpers.buildListWith(
          referralSummaryFactory,
          { audiences: ['General offence'], courseName: 'Super Course', status: 'referral_submitted' },
          {},
          16,
        ),
        pageIsEmpty: false,
        pageNumber: 1,
        pageSize: 15,
        totalElements: 16,
        totalPages: 2,
      }

      beforeEach(() => {
        provider.addInteraction({
          state:
            'Super Course referral(s) exist for organisation BWM with status REFERRAL_SUBMITTED to offerings for courses with audience General offence',
          uponReceiving:
            "A request for the second (15 length) page of organistion BWM's Super Course referral summaries with status REFERRAL_SUBMITTED to offerings for courses with audience General offence",
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
              courseName: 'Super Course',
              page: '1',
              size: '15',
              status: 'REFERRAL_SUBMITTED',
            },
          },
        })
      })

      it("fetches the given organisation's referral summaries matching the given query parameters", async () => {
        const result = await referralClient.findReferralSummaries('BWM', {
          audience: 'General offence',
          courseName: 'Super Course',
          page: '1',
          status: 'REFERRAL_SUBMITTED',
        })

        expect(result).toEqual(paginatedReferralSummaries)
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      provider.addInteraction({
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status REFERRAL_STARTED',
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
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status REFERRAL_STARTED',
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
        state: 'Referral 0c46ed09-170b-4c0f-aee8-a24eeaeeddaa exists with status REFERRAL_STARTED',
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
