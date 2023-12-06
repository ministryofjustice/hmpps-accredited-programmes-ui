import IndexPage from '../pages'
import Page from '../pages/page'
import Helpers from '../support/helpers'

context('App', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
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

  it("Doesn't show navigation on the index page", () => {
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.shouldNotContainNavigation()
  })
})
