import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'

import ReferralsController from './referralsController'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils } from '../../utils'

describe('ReferralsController', () => {
  const token = 'SOME_TOKEN'
  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()

  let referralsController: ReferralsController

  courseService.getCourseByOffering.mockResolvedValue(course)
  courseService.getOffering.mockResolvedValue(courseOffering)

  beforeEach(() => {
    referralsController = new ReferralsController(courseService, organisationService)
  })

  describe('start', () => {
    it('renders the referral start template', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = referralsController.start()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('referrals/start', {
        course: coursePresenter,
        courseOffering,
        organisation,
        pageHeading: 'Make a referral',
      })
    })

    describe('when the organisation service returns `null`', () => {
      it('responds with a 404', async () => {
        organisationService.getOrganisation.mockResolvedValue(null)

        const requestHandler = referralsController.start()
        const expectedError = createError(404)

        expect(() => requestHandler(request, response, next)).rejects.toThrowError(expectedError)
      })
    })
  })

  describe('new', () => {
    it('renders the referral new template', async () => {
      const courseId = course.id
      const courseOfferingId = courseOffering.id

      request.params.courseId = courseId
      request.params.courseOfferingId = courseOfferingId

      const requestHandler = referralsController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/new', {
        courseId,
        courseOfferingId,
        pageHeading: "Enter the person's identifier",
      })
    })
  })
})
