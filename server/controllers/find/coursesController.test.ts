import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CoursesController from './coursesController'
import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils, OrganisationUtils } from '../../utils'
import type { Course, CourseOffering } from '@accredited-programmes/models'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

describe('CoursesController', () => {
  const userToken = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})

  let controller: CoursesController

  beforeEach(() => {
    request = createMock<Request>({ user: { token: userToken } })
    response = createMock<Response>({})
    controller = new CoursesController(courseService, organisationService)
  })

  describe('index', () => {
    it('renders the courses index template with alphabetically-sorted courses', async () => {
      const courseA = courseFactory.build({ name: 'Course A' })
      const courseB = courseFactory.build({ name: 'Course B' })
      const courseC = courseFactory.build({ name: 'Course C' })
      courseService.getCourses.mockResolvedValue([courseC, courseB, courseA])

      const sortedCourses = [courseA, courseB, courseC]

      const requestHandler = controller.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('courses/index', {
        addProgrammePath: findPaths.course.add.show({}),
        courses: sortedCourses.map(course => CourseUtils.presentCourse(course)),
        pageHeading: 'Find an Accredited Programme',
      })

      expect(courseService.getCourses).toHaveBeenCalledWith(userToken)
    })
  })

  describe('show', () => {
    let course: Course

    beforeEach(() => {
      course = courseFactory.build()
      courseService.getCourse.mockResolvedValue(course)
    })

    describe('when all organisations are returned by the organisation service', () => {
      it('renders the course show template with all organisations', async () => {
        const organisations = organisationFactory.buildList(3)
        organisationService.getOrganisations.mockResolvedValue(organisations)

        const courseOfferings: Array<CourseOffering> = []
        const organisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

        organisations.forEach(organisation => {
          const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
          courseOfferings.push(courseOffering)
          organisationsWithOfferingIds.push({ ...organisation, courseOfferingId: courseOffering.id })
        })

        courseService.getOfferingsByCourse.mockResolvedValue(courseOfferings)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        const organisationIds = organisations.map(organisation => organisation.id)
        expect(organisationService.getOrganisations).toHaveBeenCalledWith(userToken, organisationIds)

        const coursePresenter = CourseUtils.presentCourse(course)
        expect(response.render).toHaveBeenCalledWith('courses/show', {
          addOfferingPath: `/find/programmes/${course.id}/offerings/add`,
          course: coursePresenter,
          organisationsTableData: OrganisationUtils.organisationTableRows(organisationsWithOfferingIds),
          pageHeading: coursePresenter.displayName,
          updateProgrammePath: `/find/programmes/${course.id}/update`,
        })
      })
    })

    describe('when some but not all organisations are returned by the organisation service', () => {
      it('renders the course show template with the returned organisations', async () => {
        const existingOrganisations = organisationFactory.buildList(2)
        organisationService.getOrganisations.mockResolvedValue(existingOrganisations)

        const nonexistentOrganisation = organisationFactory.build({ id: 'NOTFOUND' })
        const allOrganisations = [...existingOrganisations, nonexistentOrganisation]

        const courseOfferingsForExistingOrganisations: Array<CourseOffering> = []
        const existingOrganisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

        existingOrganisations.forEach(organisation => {
          const courseOffering = courseOfferingFactory.build({ organisationId: organisation.id })
          courseOfferingsForExistingOrganisations.push(courseOffering)
          existingOrganisationsWithOfferingIds.push({ ...organisation, courseOfferingId: courseOffering.id })
        })

        const courseOfferingsForAllOrganisations = [
          ...courseOfferingsForExistingOrganisations,
          courseOfferingFactory.build({ organisationId: nonexistentOrganisation.id }),
        ]

        courseService.getOfferingsByCourse.mockResolvedValue(courseOfferingsForAllOrganisations)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        const allOrganisationIds = allOrganisations.map(organisation => organisation.id)
        expect(organisationService.getOrganisations).toHaveBeenCalledWith(userToken, allOrganisationIds)

        const coursePresenter = CourseUtils.presentCourse(course)
        expect(response.render).toHaveBeenCalledWith('courses/show', {
          addOfferingPath: `/find/programmes/${course.id}/offerings/add`,
          course: coursePresenter,
          organisationsTableData: OrganisationUtils.organisationTableRows(existingOrganisationsWithOfferingIds),
          pageHeading: coursePresenter.displayName,
          updateProgrammePath: `/find/programmes/${course.id}/update`,
        })
      })
    })
  })
})
