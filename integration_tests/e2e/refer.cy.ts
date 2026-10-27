import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../server/paths'
import { referralFactory } from '../../server/testutils/factories'
import auth from '../mockApis/auth'
import AuthErrorPage from '../pages/authError'
import Page from '../pages/page'
import { NewReferralCompletePage } from '../pages/refer'

context('General Refer functionality', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  describe('When the referral has been submitted', () => {
    it('redirects pages related to that referral to the complete page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.signIn()

      const referral = referralFactory.submitted().build({ referrerUsername: auth.mockedUser.username })
      cy.task('stubReferral', referral)

      const path = referPaths.new.programmeHistory.index({ referralId: referral.id })
      cy.visit(path)

      const referralCompletePage = Page.verifyOnPage(NewReferralCompletePage)
      referralCompletePage.shouldNotContainHomeLink()
    })
  })

  describe('When a user attempts to view a draft referral and they are not the referrer user', () => {
    it('redirects to the auth error page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.signIn()

      const draftReferral = referralFactory.started().build()
      cy.task('stubReferral', draftReferral)

      const path = referPaths.new.show({ referralId: draftReferral.id })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })
})
