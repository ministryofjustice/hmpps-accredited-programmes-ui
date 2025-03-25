import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import UpdateLdcController from './updateLdcController'
import { assessPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { courseFactory, courseOfferingFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('UpdateLdcController', () => {
  const username = 'USERNAME'

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const person = personFactory.build()
  const courseOffering = courseOfferingFactory.build({})
  const course = courseFactory.build({ courseOfferings: [courseOffering] })
  const referral = referralFactory
    .submitted()
    .build({ hasLdc: true, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

  let controller: UpdateLdcController

  beforeEach(() => {
    when(courseService.getCourseByOffering).calledWith(username, referral.offeringId).mockResolvedValue(course)
    when(personService.getPerson).calledWith(username, referral.prisonNumber).mockResolvedValue(person)
    when(referralService.getReferral).calledWith(username, referral.id).mockResolvedValue(referral)

    controller = new UpdateLdcController(courseService, personService, referralService)

    request = createMock<Request>({
      params: { referralId: referral.id },
      path: assessPaths.updateLdc.show({ referralId: referral.id }),
      user: { username },
    })
    response = Helpers.createMockResponseWithCaseloads()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should render the show page with the correct response locals', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['ldcReason'])
      expect(response.render).toHaveBeenCalledWith('referrals/updateLdc/show', {
        backLinkHref: assessPaths.show.personalDetails({ referralId: referral.id }),
        hasLdc: true,
        pageHeading: 'Update Learning disabilities and challenges (LDC)',
        person,
      })
    })
  })

  describe('submit', () => {
    describe('when the ldcReason is provided', () => {
      beforeEach(() => {
        request.body.ldcReason = ['afcrSuggestion', 'scoresChanged']
      })

      it('should update the referral with hasLdcBeenOverriddenByProgrammeTeam and redirect to the case list for the referrals course', async () => {
        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(referralService.updateReferral).toHaveBeenCalledWith(username, referral.id, {
          ...referral,
          hasLdcBeenOverriddenByProgrammeTeam: true,
        })
        expect(request.flash).toHaveBeenCalledWith(
          'ldcStatusChangedMessage',
          `Update: ${person.name} may not need an LDC-adapted programme`,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          assessPaths.caseList.show({ courseId: course.id, referralStatusGroup: 'open' }),
        )
      })

      describe('when the referral hasLdc set to false', () => {
        it('should set the ldcStatusChangedMessage correctly', async () => {
          referral.hasLdc = false

          when(referralService.getReferral).calledWith(username, referral.id).mockResolvedValue(referral)

          const requestHandler = controller.submit()
          await requestHandler(request, response, next)

          expect(request.flash).toHaveBeenCalledWith(
            'ldcStatusChangedMessage',
            `Update: ${person.name} may need an LDC-adapted programme`,
          )
        })
      })
    })

    describe('when the ldcReason is not provided', () => {
      it('should set a flash error message and redirect back to the show page', async () => {
        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'ldcReasonError',
          'Select a reason for updating the learning disabilities and challenges status',
        )
        expect(response.redirect).toHaveBeenCalledWith(assessPaths.updateLdc.show({ referralId: referral.id }))
      })
    })
  })
})
