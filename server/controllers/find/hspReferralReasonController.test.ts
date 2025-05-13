import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import HspReferralReasonController from './hspReferralReasonController'
import { findPaths } from '../../paths'
import type { CourseService } from '../../services'
import { courseFactory, personFactory } from '../../testutils/factories'
import { CourseUtils, FormUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('HspReferralReasonController', () => {
  const username = 'SOME_USER'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})

  let controller: HspReferralReasonController

  const hspCourse = courseFactory.build({ name: 'Healthy Sex Programme' })
  const person = personFactory.build({ name: 'Del Hatton' })

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId: hspCourse.id },
      session: {
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
})
