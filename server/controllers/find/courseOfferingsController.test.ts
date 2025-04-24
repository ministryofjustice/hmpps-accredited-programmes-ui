import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import CourseOfferingsController from './courseOfferingsController'
import config from '../../config'
import { findPaths, referPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils, OrganisationUtils } from '../../utils'

describe('CoursesOfferingsController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'SOME_USER'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()

  let controller: CourseOfferingsController

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId: course.id, courseOfferingId: courseOffering.id },
      user: { token: userToken, username },
    })
    response = createMock<Response>({ locals: { user: { hasReferrerRole: false } } })
    controller = new CourseOfferingsController(courseService, organisationService)
  })

  describe('delete', () => {
    it('deletes the course offering and redirects to the course show page', async () => {
      const requestHandler = controller.delete()
      await requestHandler(request, response, next)

      expect(courseService.deleteOffering).toHaveBeenCalledWith(username, course.id, courseOffering.id)
      expect(response.redirect).toHaveBeenCalledWith(`/find/programmes/${course.id}`)
    })
  })

  describe('show', () => {
    beforeEach(() => {
      when(courseService.getCourseByOffering).calledWith(username, courseOffering.id).mockResolvedValue(course)
      when(courseService.getOffering).calledWith(username, courseOffering.id).mockResolvedValue(courseOffering)
    })

    it('renders the course offering show template', async () => {
      const organisation = organisationFactory.build({ id: courseOffering.organisationId })
      organisationService.getOrganisation.mockResolvedValue(organisation)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const coursePresenter = CourseUtils.presentCourse(course)

      expect(response.render).toHaveBeenCalledWith('courses/offerings/show', {
        canMakeReferral: false,
        course: coursePresenter,
        courseOffering,
        deleteOfferingAction: `/find/programmes/${course.id}/offerings/${courseOffering.id}/delete?_method=DELETE`,
        hideTitleServiceName: true,
        hrefs: {
          back: findPaths.show({ courseId: course.id }),
          makeReferral: referPaths.new.start({ courseOfferingId: courseOffering.id }),
          updateOffering: findPaths.offerings.update.show({
            courseOfferingId: courseOffering.id,
          }),
        },
        organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
          organisation,
          courseOffering,
          course.name,
        ),
        pageHeading: coursePresenter.displayName,
        pageTitleOverride: `${coursePresenter.displayName} programme at ${organisation.name}`,
      })
    })

    describe('when the building choices course id is present in the session', () => {
      it('sets the back link to the building choices course page', async () => {
        const buildingChoicesCourseId = 'bc-course-id'

        request.session.buildingChoicesData = {
          courseVariantId: buildingChoicesCourseId,
          isConvictedOfSexualOffence: 'no',
          isInAWomensPrison: 'yes',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'courses/offerings/show',
          expect.objectContaining({
            hrefs: expect.objectContaining({
              back: findPaths.buildingChoices.show({ courseId: buildingChoicesCourseId }),
            }),
          }),
        )
      })
    })

    describe('when all required conditions for making a referral are met', () => {
      it('sets canMakeReferral to true', async () => {
        config.flags.referEnabled = true
        courseOffering.referable = true
        courseOffering.organisationEnabled = true
        response.locals.user.hasReferrerRole = true
        request.session.pniFindAndReferData = {
          prisonNumber: 'A1234AA',
          programmePathway: 'HIGH_INTENSITY_BC',
        }

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'courses/offerings/show',
          expect.objectContaining({ canMakeReferral: true }),
        )
      })
    })
  })
})
