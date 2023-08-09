import { findPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { organisationUtils } from '../../server/utils'
import { CourseOfferingPage, CoursePage, CoursesPage } from '../pages/find'
import Page from '../pages/page'
import type { CourseOffering } from '@accredited-programmes/models'
import type { OrganisationWithOfferingId } from '@accredited-programmes/ui'

context('Find', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Shows a list of all courses sorted alphabetically', () => {
    cy.signIn()

    const courses = courseFactory.buildList(4)

    cy.task('stubCourses', courses)

    const path = findPaths.courses.index({})

    cy.visit(path)

    const coursesPage = Page.verifyOnPage(CoursesPage)
    coursesPage.shouldContainNavigation(path)

    const sortedCourses = [...courses].sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

    coursesPage.shouldHaveCourses(sortedCourses)
  })

  it('Shows a single course and its offerings', () => {
    cy.signIn()

    const prisons = prisonFactory.buildList(3)
    const courseOfferings: Array<CourseOffering> = []
    const organisationsWithOfferingIds: Array<OrganisationWithOfferingId> = []

    prisons.forEach((prison, prisonIndex) => {
      const courseOffering = courseOfferingFactory.build({ organisationId: prison.prisonId })
      courseOfferings.push(courseOffering)

      organisationsWithOfferingIds.push({
        ...organisationUtils.organisationFromPrison(`an-ID${prisonIndex}`, prison),
        courseOfferingId: courseOffering.id,
      })

      cy.task('stubPrison', prison)
    })

    const course = courseFactory.build()

    cy.task('stubCourse', course)
    cy.task('stubCourseOfferings', { courseId: course.id, courseOfferings })

    const path = findPaths.courses.show({ courseId: course.id })

    cy.visit(path)

    const coursePage = Page.verifyOnPage(CoursePage, course)
    coursePage.shouldContainNavigation(path)
    coursePage.shouldContainBackLink(findPaths.courses.index({}))
    coursePage.shouldHaveCourse()
    coursePage.shouldHaveOrganisations(organisationsWithOfferingIds)
  })

  describe('Viewing a single offering', () => {
    it('shows a single offering with no secondary email address', () => {
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build({
        secondaryContactEmail: null,
      })
      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = organisationUtils.organisationFromPrison('an-ID', prison)

      cy.task('stubCourse', course)
      cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)

      const path = findPaths.courses.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id })
      cy.visit(path)

      const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, { courseOffering, course, organisation })
      courseOfferingPage.shouldContainNavigation(path)
      courseOfferingPage.shouldContainBackLink(findPaths.courses.show({ courseId: course.id }))
      courseOfferingPage.shouldHaveAudience(courseOfferingPage.course.audienceTags)
      courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
      courseOfferingPage.shouldNotContainSecondaryContactEmailSummaryListItem()
    })

    it('shows a single offering with a secondary email address', () => {
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build({
        secondaryContactEmail: 'secondary-contact@nowhere.com',
      })
      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = organisationUtils.organisationFromPrison('an-ID', prison)

      cy.task('stubCourse', course)
      cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)

      const path = findPaths.courses.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id })
      cy.visit(path)

      const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, { courseOffering, course, organisation })
      courseOfferingPage.shouldContainNavigation(path)
      courseOfferingPage.shouldContainBackLink(findPaths.courses.show({ courseId: course.id }))
      courseOfferingPage.shouldHaveAudience(courseOfferingPage.course.audienceTags)
      courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
    })
  })
})
