import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import HspReferralReasonController from './hspReferralReasonController'
import { findPaths, referPaths } from '../../paths'
import type { CourseService } from '../../services'
import { courseFactory, courseOfferingFactory, personFactory } from '../../testutils/factories'
import { CourseUtils, FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('HspReferralReasonController', () => {
  const username = 'SOME_USER'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})

  let controller: HspReferralReasonController

  const nationalHspOffering = courseOfferingFactory.build({ organisationId: 'NAT' })
  const hspCourse = courseFactory.build({ courseOfferings: [nationalHspOffering], name: 'Healthy Sex Programme' })
  const person = personFactory.build({ name: 'Del Hatton' })
  const selectedOffences = ['ABC-123']

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId: hspCourse.id },
      session: {
        hspReferralData: {
          selectedOffences,
        },
        pniFindAndReferData: {
          prisonNumber: person.prisonNumber,
          programmePathway: 'HIGH_INTENSITY_BC',
        },
      },
      user: { username },
    })

    response = createMock<Response>({})
    controller = new HspReferralReasonController(courseService)

    when(courseService.getCourse).calledWith(username, hspCourse.id).mockResolvedValue(hspCourse)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('show', () => {
    it('should render the HSP referral reason page with the correct data', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['hspReferralReason'])
      expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response)
      expect(response.render).toHaveBeenCalledWith('courses/hsp/reason/show', {
        hrefs: {
          back: findPaths.hsp.notEligible.show({ courseId: hspCourse.id }),
        },
        maxLength: 5000,
        pageHeading: 'Reason for referral to HSP',
      })
    })

    describe('when there is no `prisonNumber` in `session.pniFindAndReferData`', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.prisonNumber

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when there is no `programmePathway` in `session.pniFindAndReferData`', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.programmePathway

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when the course is not an HSP course', () => {
      it('should redirect to the person search page', async () => {
        jest.spyOn(CourseUtils, 'isHsp').mockReturnValue(false)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      when(courseService.getNationalOffering).calledWith(username, hspCourse.id).mockResolvedValue(nationalHspOffering)
    })

    it('should redirect to the next page when the referral reason is valid', async () => {
      request.body = { hspReferralReason: 'Valid reason' }

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.session.hspReferralData).toEqual({
        eligibilityOverrideReason: 'Valid reason',
        selectedOffences,
      })
      expect(response.redirect).toHaveBeenCalledWith(referPaths.new.start({ courseOfferingId: nationalHspOffering.id }))
    })

    it('should redirect back to the form with an error message when the referral reason is empty', async () => {
      request.body = { hspReferralReason: '' }

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith(
        'hspReferralReasonError',
        'Please enter a reason for referring this person to HSP',
      )
      expect(response.redirect).toHaveBeenCalledWith(findPaths.hsp.reason.show({ courseId: hspCourse.id }))
    })

    it('should redirect back to the form with an error message when the referral reason exceeds max length', async () => {
      const longReason = 'a'.repeat(5001)
      request.body = { hspReferralReason: longReason }

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('hspReferralReasonError', 'Reason must be less than 5000 characters')
      expect(request.flash).toHaveBeenCalledWith('formValues', [
        JSON.stringify({ formattedHspReferralReason: longReason }),
      ])
      expect(response.redirect).toHaveBeenCalledWith(findPaths.hsp.reason.show({ courseId: hspCourse.id }))
    })

    describe('when there is hspReferralData in the session', () => {
      it('should redirect back to the person search page', async () => {
        delete request.session.hspReferralData

        request.body = { hspReferralReason: 'A valid reason' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch({}))
      })
    })

    describe('when there is no national offering for HSP', () => {
      it('should redirect back to the person search page', async () => {
        when(courseService.getNationalOffering).calledWith(username, hspCourse.id).mockResolvedValue(undefined)

        request.body = { hspReferralReason: 'A valid reason' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch({}))
      })
    })
  })
})
