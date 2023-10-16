import { referPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory } from '../../server/testutils/factories'
import AuthErrorPage from '../pages/authError'
import Page from '../pages/page'

context('General Refer functionality', () => {
  describe('When the user does not have the `ROLE_ACP_REFERRER` role', () => {
    it('shows the authentication error page', () => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      cy.task('stubPrison', prison)

      const path = referPaths.start({ courseOfferingId: courseOffering.id })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })
})
