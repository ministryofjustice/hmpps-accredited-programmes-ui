import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory, referralFactory } from '../../server/testutils/factories'
import AuthErrorPage from '../pages/authError'
import Page from '../pages/page'
import { NewReferralCompletePage } from '../pages/refer'

context('General Refer functionality', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  describe('When the user does not have the `ROLE_ACP_REFERRER` role', () => {
    it('shows the authentication error page', () => {
      cy.task('stubSignIn', { authorities: [] })
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      cy.task('stubPrison', prison)

      const path = referPaths.new.start({ courseOfferingId: courseOffering.id })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })

  describe('When the referral has been submitted', () => {
    it('redirects pages related to that referral to the complete page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.signIn()

      const referral = referralFactory.submitted().build({})
      cy.task('stubReferral', referral)

      const path = referPaths.new.programmeHistory.index({ referralId: referral.id })
      cy.visit(path)

      Page.verifyOnPage(NewReferralCompletePage)
    })
  })
})
