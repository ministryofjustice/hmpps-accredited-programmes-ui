import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import CoursesController from './coursesController'
import config from '../../config'
import { ApplicationRoles } from '../../middleware'
import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils, OrganisationUtils } from '../../utils'
import type { CourseOffering } from '@accredited-programmes/models'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

describe('CoursesController', () => {
  const userToken = 'SOME_TOKEN'
  const username = 'SOME_USER'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})

  let controller: CoursesController

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        buildingChoicesData: {
          courseVariantId: 'bc-course-id',
          isConvictedOfSexualOffence: 'true',
          isInAWomensPrison: 'false',
        },
        pniFindAndReferData: {
          prisonNumber: 'some-prison-number',
          programmePathway: 'HIGH_INTENSITY_BC',
        },
      },
      user: { token: userToken, username },
    })
    response = createMock<Response>({
      locals: {
        user: {
          roles: [],
        },
      },
    })
    controller = new CoursesController(courseService, organisationService)
  })

  describe('index', () => {
    it('renders the courses index template with alphabetically-sorted courses and reset `pniFindAndReferData` and `buildingChoicesData`', async () => {
      const courses = [
        courseFactory.build({ name: 'Course A' }),
        courseFactory.build({ name: 'Course B' }),
        courseFactory.build({ name: 'Course C' }),
        courseFactory.build({ displayOnProgrammeDirectory: false, name: 'Course D' }),
      ]
      when(courseService.getCourses).calledWith(username).mockResolvedValue(courses)

      expect(request.session.buildingChoicesData).toBeDefined()
      expect(request.session.pniFindAndReferData).toBeDefined()

      const requestHandler = controller.index()
      await requestHandler(request, response, next)

      expect(request.session.buildingChoicesData).toBeUndefined()
      expect(request.session.pniFindAndReferData).toBeUndefined()
      expect(response.render).toHaveBeenCalledWith('courses/index', {
        addProgrammePath: findPaths.course.add.show({}),
        courses: courses
          .filter(course => course.displayOnProgrammeDirectory)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(course => CourseUtils.presentCourse(course)),
        hideTitleServiceName: true,
        pageHeading: 'Find an Accredited Programme',
      })

      expect(courseService.getCourses).toHaveBeenCalledWith(username)
    })
  })

  describe('show', () => {
    const course = courseFactory.build()
    const noOfferingsMessage = 'No offerings found for this course.'
    const organisations = organisationFactory.buildList(3)
    organisationService.getOrganisations.mockResolvedValue(organisations)

    const courseOfferings: Array<CourseOffering> = []
    const organisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

    organisations.forEach(organisation => {
      const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
      courseOfferings.push(courseOffering)
      organisationsWithOfferingIds.push({
        ...organisation,
        courseOfferingId: courseOffering.id,
        withdrawn: courseOffering.withdrawn,
      })
    })

    beforeEach(() => {
      request.params.courseId = course.id

      when(courseService.getCourse).calledWith(username, course.id).mockResolvedValue(course)
      when(courseService.getOfferingsByCourse).calledWith(username, course.id).mockResolvedValue(courseOfferings)
      when(courseService.getOfferingsByCourse)
        .calledWith(username, course.id, { includeWithdrawn: false })
        .mockResolvedValue(courseOfferings)

      jest.spyOn(CourseUtils, 'noOfferingsMessage').mockReturnValue(noOfferingsMessage)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('renders the course show template with all organisations', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const organisationIds = organisations.map(organisation => organisation.id)
      expect(organisationService.getOrganisations).toHaveBeenCalledWith(userToken, organisationIds)

      const coursePresenter = CourseUtils.presentCourse(course)
      expect(response.render).toHaveBeenCalledWith('courses/show', {
        course: coursePresenter,
        hideTitleServiceName: true,
        hrefs: {
          addOffering: findPaths.offerings.add.create({ courseId: course.id }),
          back: findPaths.pniFind.recommendedProgrammes({}),
          startHspReferral: undefined,
          updateProgramme: findPaths.course.update.show({ courseId: course.id }),
        },
        isBuildingChoices: false,
        isHsp: false,
        noOfferingsMessage,
        organisationsTableData: OrganisationUtils.organisationTableRows(
          organisationsWithOfferingIds.filter(
            organisationsWithOfferingId => organisationsWithOfferingId.withdrawn === false,
          ),
        ),
        pageHeading: coursePresenter.displayName,
        pageTitleOverride: `${coursePresenter.displayName} programme description`,
        withdrawnOrganisationsTableData: OrganisationUtils.organisationTableRows(
          organisationsWithOfferingIds.filter(
            organisationsWithOfferingId => organisationsWithOfferingId.withdrawn === true,
          ),
        ),
      })
    })

    describe('when viewing the "Healthy sex programme" course and the feature is enabled', () => {
      it('renders the course show template with `canReferToHsp` set to `true`', async () => {
        jest.spyOn(CourseUtils, 'isHsp').mockReturnValue(true)
        config.flags.hspEnabled = true

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'courses/show',
          expect.objectContaining({
            hrefs: expect.objectContaining({
              startHspReferral: findPaths.hsp.details.show({ courseId: course.id }),
            }),
          }),
        )
      })
    })

    describe('when there is no `pniFindAndReferData` in the session', () => {
      it('should have the correct back link to the find directory index', async () => {
        delete request.session.pniFindAndReferData

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'courses/show',
          expect.objectContaining({
            hrefs: expect.objectContaining({
              back: findPaths.index({}),
            }),
          }),
        )
      })
    })

    describe('when the user has the ACP_EDITOR role', () => {
      it('should call the getOfferingsByCourse service method with the query parameter includeWithdrawal set to true', async () => {
        response.locals.user.roles = [ApplicationRoles.ACP_EDITOR]

        when(courseService.getOfferingsByCourse)
          .calledWith(username, course.id, { includeWithdrawn: true })
          .mockResolvedValue(courseOfferings)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(courseService.getOfferingsByCourse).toHaveBeenCalledWith(username, course.id, { includeWithdrawn: true })

        const organisationIds = organisations.map(organisation => organisation.id)
        expect(organisationService.getOrganisations).toHaveBeenCalledWith(userToken, organisationIds)

        const coursePresenter = CourseUtils.presentCourse(course)
        expect(response.render).toHaveBeenCalledWith('courses/show', {
          course: coursePresenter,
          hideTitleServiceName: true,
          hrefs: {
            addOffering: findPaths.offerings.add.create({ courseId: course.id }),
            back: findPaths.pniFind.recommendedProgrammes({}),
            startHspReferral: undefined,
            updateProgramme: findPaths.course.update.show({ courseId: course.id }),
          },
          isBuildingChoices: false,
          isHsp: false,
          noOfferingsMessage,
          organisationsTableData: OrganisationUtils.organisationTableRows(
            organisationsWithOfferingIds.filter(
              organisationsWithOfferingId => organisationsWithOfferingId.withdrawn === false,
            ),
          ),
          pageHeading: coursePresenter.displayName,
          pageTitleOverride: `${coursePresenter.displayName} programme description`,
          withdrawnOrganisationsTableData: OrganisationUtils.organisationTableRows(
            organisationsWithOfferingIds.filter(
              organisationsWithOfferingId => organisationsWithOfferingId.withdrawn === true,
            ),
          ),
        })
      })
    })
  })
})
