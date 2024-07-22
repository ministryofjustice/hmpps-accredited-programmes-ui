import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import NewReferralsOasysConfirmationController from './oasysConfirmationController'
import { authPaths, referPaths } from '../../../paths'
import type { OasysService, PersonService, ReferralService } from '../../../services'
import { courseOfferingFactory, personFactory, referralFactory } from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { DateUtils, FormUtils, TypeUtils } from '../../../utils'

jest.mock('../../../utils/dateUtils')
jest.mock('../../../utils/formUtils')

const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>

describe('NewReferralsOasysConfirmationController', () => {
  const username = 'SOME_USERNAME'
  const otherUsername = 'SOME_OTHER_USERNAME'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const oasysService = createMock<OasysService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const courseOffering = courseOfferingFactory.build()
  const person = personFactory.build()
  const referralId = 'A-REFERRAL-ID'
  const draftReferral = referralFactory.started().build({
    id: referralId,
    oasysConfirmed: false,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: username,
  })
  const submittedReferral = referralFactory.submitted().build({
    id: referralId,
    oasysConfirmed: false,
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: username,
  })
  const assessmentDateInfo = { hasOpenAssessment: true, recentCompletedAssessmentDate: '2023-12-19' }

  let controller: NewReferralsOasysConfirmationController

  beforeEach(() => {
    request = createMock<Request>({ params: { referralId }, user: { username } })
    response = Helpers.createMockResponseWithCaseloads()
    controller = new NewReferralsOasysConfirmationController(oasysService, personService, referralService)

    mockDateUtils.govukFormattedFullDateString.mockReturnValue('19 December 2023')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    beforeEach(() => {
      personService.getPerson.mockResolvedValue(person)
      referralService.getReferral.mockResolvedValue(draftReferral)
    })

    it('renders the show template for confirming OASys information is up to date', async () => {
      oasysService.getAssessmentDateInfo.mockResolvedValue(assessmentDateInfo)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
      expect(response.render).toHaveBeenCalledWith('referrals/new/oasysConfirmation/show', {
        hasOpenAssessment: true,
        pageHeading: 'Check risks and needs information (OASys)',
        person,
        recentCompletedAssessmentDate: '19 December 2023',
        referral: draftReferral,
      })
      expect(DateUtils.govukFormattedFullDateString).toHaveBeenCalledWith(
        assessmentDateInfo.recentCompletedAssessmentDate,
      )
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['oasysConfirmed'])
    })

    describe('when there is no assessment information', () => {
      it('renders the show template without the assessment information', async () => {
        oasysService.getAssessmentDateInfo.mockResolvedValue({})

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
        expect(response.render).toHaveBeenCalledWith('referrals/new/oasysConfirmation/show', {
          hasOpenAssessment: undefined,
          pageHeading: 'Check risks and needs information (OASys)',
          person,
          recentCompletedAssessmentDate: undefined,
          referral: draftReferral,
        })
        expect(DateUtils.govukFormattedFullDateString).not.toHaveBeenCalled()
        expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['oasysConfirmed'])
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })
  })

  describe('update', () => {
    it("asks the service to update the field and redirects to the ReferralController's show action", async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)

      request.body.oasysConfirmed = true

      const requestHandler = controller.update()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.show({ referralId }))
      expect(referralService.updateReferral).toHaveBeenCalledWith(username, referralId, {
        additionalInformation: draftReferral.additionalInformation,
        hasReviewedProgrammeHistory: draftReferral.hasReviewedProgrammeHistory,
        oasysConfirmed: true,
      })
    })

    describe('when the `oasysConfirmed` field is not set', () => {
      it('redirects back to the confirm oasys page with an error', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.confirmOasys.show({ referralId }))
        expect(request.flash).toHaveBeenCalledWith(
          'oasysConfirmedError',
          'Tick the box to confirm the OASys information is up to date',
        )
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the logged in user is not the referrer', () => {
      it('redirects to the auth error page', async () => {
        TypeUtils.assertHasUser(request)

        request.user.username = otherUsername

        referralService.getReferral.mockResolvedValue(draftReferral)

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(otherUsername, referralId)
        expect(response.redirect).toHaveBeenCalledWith(authPaths.error({}))
      })
    })
  })
})
