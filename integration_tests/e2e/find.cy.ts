import findPaths from '../../server/paths/find'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { organisationFromPrison } from '../../server/utils/organisationUtils'
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

  it('Shows a list of all courses', () => {
    cy.signIn()

    const courses = courseFactory.buildList(4)

    cy.task('stubCourses', courses)

    cy.visit(findPaths.courses.index({}))

    const coursesPage = Page.verifyOnPage(CoursesPage)
    coursesPage.shouldHaveCourses(courses)
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
        ...organisationFromPrison(`an-ID${prisonIndex}`, prison),
        courseOfferingId: courseOffering.id,
      })

      cy.task('stubPrison', prison)
    })

    const course = courseFactory.build()

    cy.task('stubCourse', course)
    cy.task('stubCourseOfferings', { courseId: course.id, courseOfferings })

    cy.visit(findPaths.courses.show({ courseId: course.id }))

    const coursePage = Page.verifyOnPage(CoursePage, course)
    coursePage.shouldHaveCourse()
    coursePage.shouldHaveOrganisations(organisationsWithOfferingIds)
  })

  describe('Viewing a single offering', () => {
    it('shows a single offering with no secondary email address', () => {
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build({
        secondaryContactEmail: '',
      })
      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = organisationFromPrison('an-ID', prison)

      cy.task('stubCourse', course)
      cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)

      cy.visit(findPaths.courses.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id }))

      const courseOfferingPage = CoursePage.verifyOnPage(CourseOfferingPage, { courseOffering, course, organisation })
      courseOfferingPage.shouldHaveAudience()
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
      const organisation = organisationFromPrison('an-ID', prison)

      cy.task('stubCourse', course)
      cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)

      cy.visit(findPaths.courses.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id }))

      const courseOfferingPage = CoursePage.verifyOnPage(CourseOfferingPage, { courseOffering, course, organisation })
      courseOfferingPage.shouldHaveAudience()
      courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
    })
  })
})
