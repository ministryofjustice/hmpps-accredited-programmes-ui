import { referPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import NotFoundPage from '../pages/notFound'
import Page from '../pages/page'

context('Refer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it("Doesn't show the start page for a referral", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({
      secondaryContactEmail: null,
    })
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })

    cy.task('stubCourse', course)
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.start({ courseId: course.id, courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })
})
