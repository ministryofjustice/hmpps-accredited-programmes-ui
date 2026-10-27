import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../server/paths'
import AuthErrorPage from '../pages/authError'
import Page from '../pages/page'

context('General Assess functionality', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  describe('When the user does not have the `ROLE_ACP_PROGRAMME_TEAM` role', () => {
    it('shows the auth error page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.signIn()

      const path = assessPaths.show.additionalInformation({ referralId: 'an-ID' })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })
})
