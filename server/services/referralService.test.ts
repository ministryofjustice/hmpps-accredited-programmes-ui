import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import ReferralService from './referralService'
import type UserService from './userService'
import logger from '../../logger'
import type { RedisClient } from '../data'
import { HmppsAuthClient, ReferralClient, TokenStore } from '../data'
import { referralFactory, referralStatusHistoryFactory, referralViewFactory } from '../testutils/factories'
import type { CreatedReferralResponse, ReferralStatus, ReferralUpdate } from '@accredited-programmes/models'

jest.mock('../data/accreditedProgrammesApi/referralClient')
jest.mock('../data/hmppsAuthClient')
jest.mock('../../logger')

const redisClient = createMock<RedisClient>({})
const tokenStore = new TokenStore(redisClient) as jest.Mocked<TokenStore>
const systemToken = 'SOME_SYSTEM_TOKEN'
const userToken = 'SOME_USER_TOKEN'
const username = 'USERNAME'

describe('ReferralService', () => {
  const referralClient = new ReferralClient(systemToken) as jest.Mocked<ReferralClient>
  const referralClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const userService = createMock<UserService>()
  const service = new ReferralService(hmppsAuthClientBuilder, referralClientBuilder, userService)

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
        .calledWith(referral.offeringId, referral.prisonNumber)
        .mockResolvedValue(createdReferralResponse)

      const result = await service.createReferral(username, referral.offeringId, referral.prisonNumber)

      expect(result).toEqual(createdReferralResponse)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.create).toHaveBeenCalledWith(referral.offeringId, referral.prisonNumber)
    })
  })

  describe('getMyReferralViews', () => {
    it('returns a list of referral views for the logged in user', async () => {
      const referralViews = referralViewFactory.buildList(3)
      const paginatedReferralViewsResponse = {
        content: referralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: referralViews.length,
        totalPages: 1,
      }

      when(referralClient.findMyReferralViews).calledWith(undefined).mockResolvedValue(paginatedReferralViewsResponse)

      const result = await service.getMyReferralViews(username, undefined)

      expect(result).toEqual(paginatedReferralViewsResponse)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findMyReferralViews).toHaveBeenCalledWith(undefined)
    })

    describe('with query values', () => {
      it('makes the correct call to the referral client', async () => {
        const query = {
          page: '1',
          status: 'REFERRAL_SUBMITTED',
        }

        await service.getMyReferralViews(username, query)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.findMyReferralViews).toHaveBeenCalledWith(query)
      })
    })
  })

  describe('getReferral', () => {
    const referral = referralFactory.build()

    it('returns a given referral', async () => {
      when(referralClient.find).calledWith(referral.id, undefined).mockResolvedValue(referral)

      const result = await service.getReferral(username, referral.id)
      expect(referralClient.find).toHaveBeenCalledWith(referral.id, undefined)
      expect(result).toEqual(referral)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.find).toHaveBeenCalledWith(referral.id, undefined)
    })

    describe('with query values', () => {
      it('makes the correct call to the referral client', async () => {
        const query = {
          updatePerson: 'true',
        }

        when(referralClient.find).calledWith(referral.id, query).mockResolvedValue(referral)

        const result = await service.getReferral(username, referral.id, query)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.find).toHaveBeenCalledWith(referral.id, query)
        expect(result).toEqual(referral)
      })
    })
  })

  describe('getReferralStatusHistory', () => {
    const referralId = 'referral-id'
    const startedStatusHistory = referralStatusHistoryFactory.started().build({ username: 'ANOTHER_USER' })
    const submittedStatusHistory = referralStatusHistoryFactory.submitted().build({ username: 'ANOTHER_USER' })
    const updatedStatusHistory = referralStatusHistoryFactory.updated().build({ username })

    const referralStatusHistory = [updatedStatusHistory, submittedStatusHistory, startedStatusHistory]

    it('returns a referrals status history with the users full name', async () => {
      when(referralClient.findReferralStatusHistory).calledWith(referralId).mockResolvedValue(referralStatusHistory)

      when(userService.getFullNameFromUsername).calledWith(userToken, username).mockResolvedValue('Current User')
      when(userService.getFullNameFromUsername).calledWith(userToken, 'ANOTHER_USER').mockResolvedValue('Another User')

      const result = await service.getReferralStatusHistory(userToken, username, referralId)

      expect(result).toEqual([
        {
          ...updatedStatusHistory,
          byLineText: 'You',
        },
        {
          ...submittedStatusHistory,
          byLineText: 'Another User',
        },
        {
          ...startedStatusHistory,
          byLineText: 'Another User',
        },
      ])

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findReferralStatusHistory).toHaveBeenCalledWith(referralId)

      expect(userService.getFullNameFromUsername).toHaveBeenCalledTimes(2)
      expect(userService.getFullNameFromUsername).toHaveBeenCalledWith(userToken, username)
      expect(userService.getFullNameFromUsername).toHaveBeenCalledWith(userToken, 'ANOTHER_USER')
    })

    describe('when a users full name cannot be found', () => {
      it('returns a referrals status history with "Unknown user"', async () => {
        when(referralClient.findReferralStatusHistory).calledWith(referralId).mockResolvedValue(referralStatusHistory)

        when(userService.getFullNameFromUsername).calledWith(userToken, username).mockResolvedValue('Current User')
        when(userService.getFullNameFromUsername)
          .calledWith(userToken, 'ANOTHER_USER')
          .mockRejectedValue(new Error('User not found'))

        const result = await service.getReferralStatusHistory(userToken, username, referralId)

        expect(result).toEqual([
          {
            ...updatedStatusHistory,
            byLineText: 'You',
          },
          {
            ...submittedStatusHistory,
            byLineText: 'Unknown user',
          },
          {
            ...startedStatusHistory,
            byLineText: 'Unknown user',
          },
        ])

        expect(logger.error).toHaveBeenCalledWith(
          'Failed to get full name for username ANOTHER_USER: Error: User not found',
        )

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.findReferralStatusHistory).toHaveBeenCalledWith(referralId)

        expect(userService.getFullNameFromUsername).toHaveBeenCalledTimes(2)
        expect(userService.getFullNameFromUsername).toHaveBeenCalledWith(userToken, username)
        expect(userService.getFullNameFromUsername).toHaveBeenCalledWith(userToken, 'ANOTHER_USER')
      })
    })
  })

  describe('getNumberOfTasksCompleted', () => {
    let referralService: ReferralService

    beforeEach(() => {
      referralService = createMock<ReferralService>(service)
    })

    it.each`
      referralFormFields                                                                                          | expectedTasksCompleted
      ${{ additionalInformation: '', hasReviewedProgrammeHistory: false, oasysConfirmed: false }}                 | ${1}
      ${{ additionalInformation: 'Some information', hasReviewedProgrammeHistory: false, oasysConfirmed: false }} | ${2}
      ${{ additionalInformation: 'Some information', hasReviewedProgrammeHistory: true, oasysConfirmed: false }}  | ${3}
      ${{ additionalInformation: 'Some information', hasReviewedProgrammeHistory: true, oasysConfirmed: true }}   | ${4}
    `(
      'returns $expectedTasksCompleted when $referralFormFields',
      async ({ referralFormFields, expectedTasksCompleted }) => {
        const referral = referralFactory.started().build({
          ...referralFormFields,
        })

        when(referralService.getReferral).calledWith(username, referral.id).mockResolvedValue(referral)

        const result = await referralService.getNumberOfTasksCompleted(username, referral.id)

        expect(result).toEqual(expectedTasksCompleted)
      },
    )
  })

  describe('getReferralViews', () => {
    const organisationId = 'organisation-id'

    it('returns a list of referral vuews for a given organisation', async () => {
      const referralViews = referralViewFactory.buildList(3)
      const paginatedReferralViewsResponse = {
        content: referralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 10,
        totalElements: referralViews.length,
        totalPages: 1,
      }

      when(referralClient.findReferralViews)
        .calledWith(organisationId, undefined)
        .mockResolvedValue(paginatedReferralViewsResponse)

      const result = await service.getReferralViews(username, organisationId, undefined)

      expect(result).toEqual(paginatedReferralViewsResponse)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findReferralViews).toHaveBeenCalledWith(organisationId, undefined)
    })

    describe('with query values', () => {
      it('makes the correct call to the referral client', async () => {
        const query = {
          audience: 'General offence',
          courseName: 'Lime Course',
          page: '1',
          sortColumn: 'surname',
          sortDirection: 'ascending',
          status: 'REFERRAL_SUBMITTED',
        }

        await service.getReferralViews(username, organisationId, query)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.findReferralViews).toHaveBeenCalledWith(organisationId, query)
      })
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
