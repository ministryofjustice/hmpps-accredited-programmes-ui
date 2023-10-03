import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import AuthErrorPage from '../pages/authError'
import Page from '../pages/page'

context('General Refer functionality', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  describe('When the user does not have the `ROLE_ACP_REFERRER` role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
    })

    it('shows the authentication error page', () => {
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubPrison', prison)

      const path = referPaths.start({ courseOfferingId: courseOffering.id })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })
})
