import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import TransferReferralController from './transferReferralController'
import { assessPaths } from '../../paths'
import type { CourseService, PersonService, PniService, ReferralService } from '../../services'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  pniScoreFactory,
  referralFactory,
  referralStatusHistoryFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils, ShowReferralUtils } from '../../utils'
import type { MojTimelineItem, ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { PniScore, Referral } from '@accredited-programmes-api'

jest.mock('../../utils/formUtils')
jest.mock('../../utils/referrals/showReferralUtils')

const mockShowReferralUtils = ShowReferralUtils as jest.Mocked<typeof ShowReferralUtils>

describe('TransferReferralController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const pniService = createMock<PniService>({})
  const referralService = createMock<ReferralService>({})

  const person = personFactory.build()
  const originalReferralCourse = courseFactory.build()
  const buildingChoicesCourseOffering = courseOfferingFactory.build()
  const buildingChoicesCourse = courseFactory.build({
    courseOfferings: [buildingChoicesCourseOffering],
    name: 'Building Choices: moderate intensity',
  })
  const timelineItems: Array<MojTimelineItem> = [
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral submitted' },
    },
    {
      byline: { text: 'Test User' },
      datetime: { timestamp: new Date().toISOString(), type: 'datetime' },
      html: 'html',
      label: { text: 'Referral started' },
    },
  ]
  let pniScore: PniScore
  let referral: Referral
  let referralStatusHistory: Array<ReferralStatusHistoryPresenter>

  let controller: TransferReferralController

  beforeEach(() => {
    pniScore = pniScoreFactory.build({ programmePathway: 'MODERATE_INTENSITY_BC' })

    referral = referralFactory.submitted().build({ prisonNumber: person.prisonNumber })
    referralStatusHistory = [{ ...referralStatusHistoryFactory.submitted().build(), byLineText: 'You' }]

    mockShowReferralUtils.statusHistoryTimelineItems.mockReturnValue(timelineItems)

    when(courseService.getBuildingChoicesCourseByReferral)
      .calledWith(username, referral.id, pniScore.programmePathway)
      .mockResolvedValue(buildingChoicesCourse)
    when(courseService.getCourseByOffering).mockResolvedValue(originalReferralCourse)

    when(personService.getPerson).calledWith(username, referral.prisonNumber).mockResolvedValue(person)

    when(pniService.getPni)
      .calledWith(username, referral.prisonNumber, { gender: person.gender })
      .mockResolvedValue(pniScore)

    when(referralService.getReferral).calledWith(username, referral.id).mockResolvedValue(referral)
    when(referralService.getReferralStatusHistory)
      .calledWith(userToken, username, referral.id)
      .mockResolvedValue(referralStatusHistory)
    when(referralService.getDuplicateReferrals)
      .calledWith(username, buildingChoicesCourseOffering.id, referral.prisonNumber)
      .mockResolvedValue([])

    controller = new TransferReferralController(courseService, personService, pniService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.transfer.show({ referralId: referral.id }),
      session: {
        transferErrorData: {
          errorMessage: 'AN_ERROR',
          originalOfferingId: 'offering-id',
          prisonNumber: 'prison-number',
        },
      },
      user: { token: userToken, username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show page with the correct data', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(request.session.transferErrorData).toBeUndefined()

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['transferReason'])
      expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, {
        targetOfferingId: buildingChoicesCourseOffering.id,
      })

      expect(response.render).toHaveBeenCalledWith('referrals/transfer/show', {
        backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
        confirmationText: {
          primaryDescription: `This will transfer the referral from ${originalReferralCourse.name} to ${buildingChoicesCourse.name}.`,
          secondaryDescription: `You must give a reason for transferring this referral to ${buildingChoicesCourse.name}.`,
          secondaryHeading: 'Move referral',
          warningText: `The ${originalReferralCourse.name} referral will close. A new referral to ${buildingChoicesCourse.name} will be created.`,
        },
        maxReasonLength: 500,
        pageHeading: `Move referral to ${buildingChoicesCourse.name}`,
        person,
        timelineItems: timelineItems.slice(0, 1),
      })
    })

    describe('when the referral is closed', () => {
      it('should redirect to the personal details page', async () => {
        referral.closed = true

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.personalDetails({ referralId: referral.id }))
      })
    })

    describe('when the referral status is on_programme', () => {
      it('should redirect to the personal details page', async () => {
        referral.status = 'on_programme'

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.personalDetails({ referralId: referral.id }))
      })
    })

    describe('when there is no PNI Score', () => {
      it('should set `transferErrorData` in the session with `MISSING_INFORMATION` error and redirect to the transfer error page', async () => {
        when(pniService.getPni)
          .calledWith(username, referral.prisonNumber, { gender: person.gender })
          .mockResolvedValue(null)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.transferErrorData).toEqual({
          errorMessage: 'MISSING_INFORMATION',
          originalOfferingId: referral.offeringId,
          originalReferralId: referral.id,
          prisonNumber: person.prisonNumber,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          `${assessPaths.transfer.show({ referralId: referral.id })}/error`,
        )
      })
    })

    describe('when the PNI score means the referral is not transferable', () => {
      it.each([['MISSING_INFORMATION'], ['ALTERNATIVE_PATHWAY']])(
        'should set `transferErrorData` in the session with `%s` error and redirect to the transfer error page',
        async programmePathway => {
          pniScore.programmePathway = programmePathway

          when(pniService.getPni)
            .calledWith(username, referral.prisonNumber, { gender: person.gender })
            .mockResolvedValue(pniScore)

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(request.session.transferErrorData).toEqual({
            errorMessage: programmePathway,
            originalOfferingId: referral.offeringId,
            originalReferralId: referral.id,
            prisonNumber: person.prisonNumber,
          })
          expect(response.redirect).toHaveBeenCalledWith(
            `${assessPaths.transfer.show({ referralId: referral.id })}/error`,
          )
        },
      )
    })

    describe('when there is no Building Choices course', () => {
      it('should set `transferErrorData` in the session with `NO_COURSE` error and redirect to the transfer error page', async () => {
        when(courseService.getBuildingChoicesCourseByReferral)
          .calledWith(username, referral.id, pniScore.programmePathway)
          .mockResolvedValue(null)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.transferErrorData).toEqual({
          errorMessage: 'NO_COURSE',
          originalOfferingId: referral.offeringId,
          originalReferralId: referral.id,
          prisonNumber: person.prisonNumber,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          `${assessPaths.transfer.show({ referralId: referral.id })}/error`,
        )
      })
    })

    describe('when there is an error retrieving the PNI score', () => {
      it('should set `transferErrorData` in the session with the error and redirect to the transfer error page', async () => {
        const error = new Error('SOME_ERROR')

        pniService.getPni.mockRejectedValue(error)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.transferErrorData).toEqual({
          errorMessage: error.message,
          originalOfferingId: referral.offeringId,
          originalReferralId: referral.id,
          prisonNumber: person.prisonNumber,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          `${assessPaths.transfer.show({ referralId: referral.id })}/error`,
        )
      })
    })

    describe('when there is an error retrieving the Building Choices course', () => {
      it('should set `transferErrorData` in the session with the error and redirect to the transfer error page', async () => {
        const error = new Error('SOME_ERROR')

        courseService.getBuildingChoicesCourseByReferral.mockRejectedValue(error)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.transferErrorData).toEqual({
          errorMessage: error.message,
          originalOfferingId: referral.offeringId,
          originalReferralId: referral.id,
          prisonNumber: person.prisonNumber,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          `${assessPaths.transfer.show({ referralId: referral.id })}/error`,
        )
      })
    })

    describe('when there is a duplicate referral', () => {
      it('should set `transferErrorData` in the session with the error and redirect to the transfer error page', async () => {
        const duplicateReferral = referralFactory.build()

        when(referralService.getDuplicateReferrals)
          .calledWith(username, buildingChoicesCourseOffering.id, referral.prisonNumber)
          .mockResolvedValue([duplicateReferral])

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(request.session.transferErrorData).toEqual({
          duplicateReferralId: duplicateReferral.id,
          errorMessage: 'DUPLICATE',
          originalOfferingId: referral.offeringId,
          originalReferralId: referral.id,
          prisonNumber: person.prisonNumber,
        })
        expect(response.redirect).toHaveBeenCalledWith(assessPaths.transfer.error.show({ referralId: referral.id }))
      })
    })
  })

  describe('submit', () => {
    it('should redirect to the status history page of the newly transferred referral', async () => {
      const newReferral = referralFactory.submitted().build()

      when(referralService.transferReferralToBuildingChoices)
        .calledWith(username, {
          offeringId: buildingChoicesCourseOffering.id,
          referralId: referral.id,
          transferReason: 'A good enough reason.',
        })
        .mockResolvedValue(newReferral)

      request.body = {
        targetOfferingId: buildingChoicesCourseOffering.id,
        transferReason: 'A good enough reason.',
      }

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(referralService.transferReferralToBuildingChoices).toHaveBeenCalledWith(username, {
        offeringId: buildingChoicesCourseOffering.id,
        referralId: referral.id,
        transferReason: 'A good enough reason.',
      })

      expect(response.redirect).toHaveBeenCalledWith(assessPaths.show.statusHistory({ referralId: newReferral.id }))
    })

    describe('when the transfer reason is not provided', () => {
      it('should set a flash message and redirect back to the transfer form page', async () => {
        request.body.transferReason = ''

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'transferReasonError',
          'Enter a reason for transferring this referral',
        )
        expect(response.redirect).toHaveBeenCalledWith(assessPaths.transfer.show({ referralId: referral.id }))
      })
    })
  })
})
