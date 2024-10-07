import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import IndexPage from '../pages'
import Page from '../pages/page'
import Helpers from '../support/helpers'

context('App', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  describe('When the user is signed in', () => {
    beforeEach(() => {
      cy.task('stubSignIn')
      cy.signIn()
      cy.visit('/')
    })

    it('Shows the phase banner with a link to the feedback form', () => {
      cy.get('.govuk-phase-banner__content__tag').then(phaseBannerTagElement => {
        const { actual, expected } = Helpers.parseHtml(phaseBannerTagElement, 'Beta')
        expect(actual).to.equal(expected)
      })

      cy.get('.govuk-phase-banner__text').then(phaseBannerTextElement => {
        const { actual, expected } = Helpers.parseHtml(
          phaseBannerTextElement,
          'This is a new service - your feedback will help us to improve it.',
        )
        expect(actual).to.equal(expected)

        cy.wrap(phaseBannerTextElement).within(() => {
          cy.get('a').should('have.attr', 'href', 'https://eu.surveymonkey.com/r/P76THLY')
        })
      })
    })

    it('Shows a notification banner on the index page', () => {
      const bannerInnerHTML = `
        <h3 class="govuk-notification-banner__heading">Rolling out the referral service</h3>
        <p class="govuk-body">This is a new service. While we're rolling it out, referrers can only use it to refer people to Accredited Programmes at a few prisons. At the moment, you can refer to:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>Drake Hall (HMP & YOI)</li>
          <li>Fosse Way (HMP & YOI)</li>
          <li>Long Lartin (HMP)</li>
          <li>Onley (HMP)</li>
          <li>Peterborough Female (HMP & YOI)</li>
          <li>Peterborough (HMP & YOI)</li>
          <li>Stocken (HMP)</li>
          <li>Whatton (HMP)</li>
        </ul>
        <p class="govuk-body">You can still refer to other prisons using your usual process.</p>
      `
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldContainNotificationBanner('Important', bannerInnerHTML)
    })

    it('Shows the correct navigation elements', () => {
      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldNotContainNavigation()
      indexPage.shouldContainBackLink('http://dps-url')
      indexPage.shouldNotContainHomeLink()
    })
  })

  describe('When the user has the `ACP_REFERRER` role', () => {
    it('shows correct links on the index page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.signIn()
      cy.visit('/')

      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldContainLink('Find a programme and make a referral', '/find/programmes')
      indexPage.shouldContainLink('My referrals', '/refer/referrals/case-list')
      indexPage.shouldContainLink('Reporting data', '/reports')
    })
  })

  describe('When the user has the `ACP_PROGRAMME_TEAM` role', () => {
    it('shows correct links on the index page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
      cy.signIn()
      cy.visit('/')

      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldContainLink('Find a programme and make a referral', '/find/programmes')
      indexPage.shouldContainLink('Manage your programme team’s referrals', '/assess/referrals/case-list')
      indexPage.shouldContainLink('Reporting data', '/reports')
    })
  })

  describe('When the user does not have either the `ACP_REFERRER` or `ACP_PROGRAMME_TEAM` role', () => {
    it('does not show any case list links on the index page', () => {
      cy.task('stubSignIn')
      cy.signIn()
      cy.visit('/')

      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldNotContainLink('/refer/referrals/case-list')
      indexPage.shouldNotContainLink('/assess/referrals/case-list')
    })
  })
})
