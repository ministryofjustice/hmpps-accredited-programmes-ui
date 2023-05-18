import { courseFactory } from '../../server/testutils/factories'
import CoursesPage from '../pages/find/courses'
import Page from '../pages/page'

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

    cy.visit('/programmes')

    const coursesPage = Page.verifyOnPage(CoursesPage)
    coursesPage.shouldHaveCourses(courses)
  })
})
