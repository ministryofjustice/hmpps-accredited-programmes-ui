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
          cy.get('a').should('have.attr', 'href', 'https://www.smartsurvey.co.uk/s/UWK3UY/')
        })
      })
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
      indexPage.shouldContainLink('Find a programme and make a referral', '/find')
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
      indexPage.shouldContainLink('Find a programme and make a referral', '/find')
      indexPage.shouldContainLink('Manage your programme team’s referrals', '/assess/referrals/case-list')
      indexPage.shouldContainLink('Reporting data', '/reports')
    })
  })

  describe('When the user has neither the `ACP_REFERRER` or `ACP_PROGRAMME_TEAM` role', () => {
    it('should only show the reporting data link', () => {
      cy.task('stubSignIn')
      cy.signIn()
      cy.visit('/')

      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldContainLink('Find a programme and make a referral', '/find')
      indexPage.shouldNotContainLink('/refer/referrals/case-list')
      indexPage.shouldNotContainLink('/assess/referrals/case-list')
      indexPage.shouldContainLink('Reporting data', '/reports')
    })
  })

  describe('When the user has the `ACP_HSP` role', () => {
    it('shows correct links on the index page', () => {
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_HSP] })
      cy.signIn()
      cy.visit('/')

      const indexPage = Page.verifyOnPage(IndexPage)
      indexPage.shouldContainLink('Find a programme and make a referral', '/find')
      indexPage.shouldContainLink('Reporting data', '/reports')
      indexPage.shouldContainLink('HSP referrals', '/hsp-referrals')
    })
  })
})
