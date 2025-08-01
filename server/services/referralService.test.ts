import { createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import type CourseService from './courseService'
import type OrganisationService from './organisationService'
import type PniService from './pniService'
import type ReferenceDataService from './referenceDataService'
import ReferralService from './referralService'
import type UserService from './userService'
import logger from '../../logger'
import { HmppsAuthClient, ReferralClient, TokenStore, createRedisClient } from '../data'
import {
  confirmationFieldsFactory,
  courseFactory,
  courseOfferingFactory,
  hspReferralDetailsFactory,
  pniScoreFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusRefDataFactory,
  referralViewFactory,
  userFactory,
} from '../testutils/factories'
import type { ReferralStatus, ReferralStatusGroup, ReferralStatusUpdate } from '@accredited-programmes/models'
import type { Organisation, ReferralUpdate, TransferReferralRequest } from '@accredited-programmes-api'

jest.mock('../data/accreditedProgrammesApi/referralClient')
jest.mock('../data/hmppsAuthClient')
jest.mock('../../logger')

const tokenStore = new TokenStore(createRedisClient()) as jest.Mocked<TokenStore>
const systemToken = 'SOME_SYSTEM_TOKEN'
const userToken = 'SOME_USER_TOKEN'
const username = 'USERNAME'

describe('ReferralService', () => {
  const referralClient = new ReferralClient(systemToken) as jest.Mocked<ReferralClient>
  const referralClientBuilder = jest.fn()

  const hmppsAuthClient = new HmppsAuthClient(tokenStore) as jest.Mocked<HmppsAuthClient>
  const hmppsAuthClientBuilder = jest.fn()

  const userService = createMock<UserService>()
  const courseService = createMock<CourseService>()
  const pniService = createMock<PniService>()
  const organisationService = createMock<OrganisationService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const service = new ReferralService(
    hmppsAuthClientBuilder,
    referralClientBuilder,
    userService,
    courseService,
    pniService,
    organisationService,
    referenceDataService,
  )

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClientBuilder.mockReturnValue(hmppsAuthClient)
    referralClientBuilder.mockReturnValue(referralClient)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(systemToken)
  })

  describe('createReferral', () => {
    it('returns a created referral', async () => {
      const referral = referralFactory.started().build()

      when(referralClient.create).calledWith(referral.offeringId, referral.prisonNumber).mockResolvedValue(referral)

      const result = await service.createReferral(username, referral.offeringId, referral.prisonNumber)

      expect(result).toEqual(referral)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.create).toHaveBeenCalledWith(referral.offeringId, referral.prisonNumber)
    })

    describe('when there is `hspReferralData`', () => {
      it('calls the referral client createHspReferral method with the hspReferralData', async () => {
        const referral = referralFactory.started().build()
        const hspReferralData = {
          eligibilityOverrideReason: 'A valid reason',
          selectedOffences: ['ABC-123'],
        }

        when(referralClient.createHspReferral)
          .calledWith({ offeringId: referral.offeringId, prisonNumber: referral.prisonNumber, ...hspReferralData })
          .mockResolvedValue(referral)

        const result = await service.createReferral(
          username,
          referral.offeringId,
          referral.prisonNumber,
          hspReferralData,
        )

        expect(result).toEqual(referral)

        expect(hmppsAuthClientBuilder).toHaveBeenCalled()
        expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      })
    })
  })

  describe('deleteReferral', () => {
    it('asks the client to delete a referral', async () => {
      const referral = referralFactory.started().build()

      await service.deleteReferral(username, referral.id)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.deleteReferral).toHaveBeenCalledWith(referral.id)
    })
  })

  describe('getConfirmationText', () => {
    const referralId = 'referral-id'
    const chosenStatusCode = 'REFERRAL_SUBMITTED'

    it('returns confirmation fields for a given referral', async () => {
      const confirmationFields = confirmationFieldsFactory.build()

      when(referralClient.findConfirmationText)
        .calledWith(referralId, chosenStatusCode, undefined)
        .mockResolvedValue(confirmationFields)

      const result = await service.getConfirmationText(username, referralId, chosenStatusCode)

      expect(result).toEqual(confirmationFields)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findConfirmationText).toHaveBeenCalledWith(referralId, chosenStatusCode, undefined)
    })

    describe('with query values', () => {
      it('makes the correct call to the referral client', async () => {
        const query = { deselectAndKeepOpen: true, ptUser: true }
        const confirmationFields = confirmationFieldsFactory.build()

        when(referralClient.findConfirmationText)
          .calledWith(referralId, chosenStatusCode, query)
          .mockResolvedValue(confirmationFields)

        const result = await service.getConfirmationText(username, referralId, chosenStatusCode, query)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.findConfirmationText).toHaveBeenCalledWith(referralId, chosenStatusCode, query)
        expect(result).toEqual(confirmationFields)
      })
    })
  })

  describe('getDuplicateReferrals', () => {
    it('calls the `referralClient.findDuplicateReferrals` method to return a list of duplicate referrals', async () => {
      const offeringId = 'course-offering-id'
      const prisonNumber = 'ABC1234'
      const duplicateReferrals = referralFactory.buildList(2)

      when(referralClient.findDuplicateReferrals)
        .calledWith(offeringId, prisonNumber)
        .mockResolvedValue(duplicateReferrals)

      const result = await service.getDuplicateReferrals(username, offeringId, prisonNumber)

      expect(result).toEqual(duplicateReferrals)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findDuplicateReferrals).toHaveBeenCalledWith(offeringId, prisonNumber)
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
        const query: { nameOrId: string; page: string; status: string; statusGroup: ReferralStatusGroup } = {
          nameOrId: 'Hatton',
          page: '1',
          status: 'REFERRAL_SUBMITTED',
          statusGroup: 'open',
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

  describe('getHspReferralDetails', () => {
    const referral = referralFactory.build()

    it('returns hsp referral details', async () => {
      const hspReferralDetails = hspReferralDetailsFactory.build()
      when(referralClient.findHspReferralDetails).calledWith(referral.id).mockResolvedValue(hspReferralDetails)

      const result = await service.getHspReferralDetails(username, referral.id)
      expect(referralClient.findHspReferralDetails).toHaveBeenCalledWith(referral.id)
      expect(result).toEqual(hspReferralDetails)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findHspReferralDetails).toHaveBeenCalledWith(referral.id)
    })
  })

  describe('getOtherReferrals', () => {
    it('calls the correct service methods to return the information required to display other referrals for a referral', async () => {
      const loggedInUser: Express.User = { authSource: 'nomis', token: userToken, userId: 'user-id', username }
      const referral = referralFactory.build()
      const otherReferrals = referralFactory.buildList(2, {
        prisonNumber: referral.prisonNumber,
      })

      const expectedResponse = otherReferrals.map(otherReferral => {
        const user = userFactory.build({ username: otherReferral.referrerUsername })
        const status = referralStatusRefDataFactory.build()
        const organisation: Organisation = { code: 'WTI', prisonName: 'WTI' }
        const offering = courseOfferingFactory.build({
          id: otherReferral.offeringId,
          organisationId: organisation.code,
        })
        const course = courseFactory.build({ courseOfferings: [offering] })

        when(courseService.getOffering).calledWith(username, otherReferral.offeringId).mockResolvedValue(offering)
        when(courseService.getCourseByOffering).calledWith(username, otherReferral.offeringId).mockResolvedValue(course)
        when(organisationService.getOrganisationFromAcp)
          .calledWith(username, offering.organisationId)
          .mockResolvedValue(organisation)
        when(referenceDataService.getReferralStatusCodeData)
          .calledWith(username, otherReferral.status as ReferralStatus)
          .mockResolvedValue(status)
        when(userService.getUserFromUsername)
          .calledWith(userToken, otherReferral.referrerUsername)
          .mockResolvedValue(user)

        return {
          course,
          organisation,
          referral: otherReferral,
          status,
          user,
        }
      })

      when(referralClient.findOtherReferrals).calledWith(referral.id).mockResolvedValue(otherReferrals)

      const result = await service.getOtherReferrals(loggedInUser, referral.id)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)
      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('getPathways', () => {
    const prisonNumber = 'ABC1234'
    const courseOffering = courseOfferingFactory.build()
    const referral = referralFactory.build({
      offeringId: courseOffering.id,
      prisonNumber,
    })

    beforeEach(() => {
      when(referralClient.find).calledWith(referral.id).mockResolvedValue(referral)
    })

    it('should return the pathway and intensity values', async () => {
      const course = courseFactory.build({
        courseOfferings: [courseOffering],
        intensity: 'HIGH_MODERATE',
      })
      const pniScore = pniScoreFactory.build({
        prisonNumber,
        programmePathway: 'HIGH_INTENSITY_BC',
      })

      pniService.getPni.mockResolvedValue(pniScore)
      courseService.getCourseByOffering.mockResolvedValue(course)

      const result = await service.getPathways(userToken, referral.id)

      expect(result).toEqual({
        recommended: 'HIGH_INTENSITY_BC',
        requested: 'HIGH_MODERATE',
      })
    })

    describe('and the course intensity and programme pathway values are not set', () => {
      it('should return an empty object', async () => {
        const unknownCourse = courseFactory.build({
          courseOfferings: [courseOffering],
          intensity: undefined,
        })
        const unknownPniScore = pniScoreFactory.build({
          prisonNumber,
          programmePathway: undefined,
        })

        pniService.getPni.mockResolvedValue(unknownPniScore)
        courseService.getCourseByOffering.mockResolvedValue(unknownCourse)

        const result = await service.getPathways(userToken, referral.id)

        expect(result).toEqual({})
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
        const query: {
          audience: string
          courseName: string
          hasLdcString: string
          nameOrId: string
          page: string
          sortColumn: string
          sortDirection: string
          status: string
          statusGroup: ReferralStatusGroup
        } = {
          audience: 'General offence',
          courseName: 'Lime Course',
          hasLdcString: 'true',
          nameOrId: 'Hatton',
          page: '1',
          sortColumn: 'surname',
          sortDirection: 'ascending',
          status: 'REFERRAL_SUBMITTED',
          statusGroup: 'open',
        }

        await service.getReferralViews(username, organisationId, query)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.findReferralViews).toHaveBeenCalledWith(organisationId, query)
      })
    })
  })

  describe('getStatusTransitions', () => {
    it('returns a list of status transitions for a given referral', async () => {
      const referralId = 'referral-id'
      const statusTransitions = referralStatusRefDataFactory.buildList(2)

      when(referralClient.findStatusTransitions).calledWith(referralId, undefined).mockResolvedValue(statusTransitions)

      const result = await service.getStatusTransitions(username, referralId)

      expect(result).toEqual(statusTransitions)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.findStatusTransitions).toHaveBeenCalledWith(referralId, undefined)
    })

    describe('with query values', () => {
      it('makes the correct call to the referral client', async () => {
        const referralId = 'referral-id'
        const query = { deselectAndKeepOpen: true, ptUser: true }
        const statusTransitions = referralStatusRefDataFactory.buildList(2)

        when(referralClient.findStatusTransitions).calledWith(referralId, query).mockResolvedValue(statusTransitions)

        const result = await service.getStatusTransitions(username, referralId, query)

        expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
        expect(referralClient.findStatusTransitions).toHaveBeenCalledWith(referralId, query)
        expect(result).toEqual(statusTransitions)
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

  describe('transferReferralToBuildingChoices', () => {
    it('asks the client to transfer a referral to Building Choices', async () => {
      const transferRequest: TransferReferralRequest = {
        offeringId: 'offering-id',
        referralId: 'referral-id',
        transferReason: 'Because I want to.',
      }

      await service.transferReferralToBuildingChoices(username, transferRequest)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.transferToBuildingChoices).toHaveBeenCalledWith(transferRequest)
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
      const statusUpdate: ReferralStatusUpdate = { status: 'referral_submitted' }

      await service.updateReferralStatus(username, referralId, statusUpdate)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)

      expect(hmppsAuthClientBuilder).toHaveBeenCalled()
      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith(username)

      expect(referralClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(referralClient.updateStatus).toHaveBeenCalledWith(referralId, statusUpdate)
    })
  })
})
