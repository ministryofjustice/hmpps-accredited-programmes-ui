import paths from '../../server/paths/find'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import { CoursePage, CoursesPage } from '../pages/find'
import Page from '../pages/page'
import type { CourseOffering } from '@accredited-programmes/models'

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

    cy.visit(paths.courses.index({}))

    const coursesPage = Page.verifyOnPage(CoursesPage)
    coursesPage.shouldHaveCourses(courses)
  })

  it('Shows a single course and its offerings', () => {
    cy.signIn()

    const prisons = prisonFactory.buildList(3)
    const courseOfferings: Array<CourseOffering> = []

    prisons.forEach(prison => {
      courseOfferings.push(courseOfferingFactory.build({ organisationId: prison.agencyId }))
      cy.task('stubPrison', prison)
    })

    const course = courseFactory.build()

    cy.task('stubCourse', course)
    cy.task('stubCourseOfferings', { courseId: course.id, courseOfferings })

    cy.visit(paths.courses.show({ id: course.id }))

    const coursePage = Page.verifyOnPage(CoursePage, course)
    coursePage.shouldHaveCourse()
    coursePage.shouldHavePrisons(prisons)
  })
})
