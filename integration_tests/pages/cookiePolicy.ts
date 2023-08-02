import Page from './page'

export default class CookiePolicyPage extends Page {
  constructor() {
    super('Cookies')
  }

  shouldContainCookieConfirmationBanner() {
    cy.get('.govuk-cookie-banner').should('contain', 'You’ve accepted additional cookies')
  }

  shouldNotContainCookieBanner() {
    cy.get('.govuk-cookie-banner').should('not.exist')
  }

  shouldContainCookieSettingRadioButtons() {
    cy.get('.govuk-form-group').within(radioButtonsContainer => {
      this.shouldContainRadioButtonsWithLegend(
        'Do you want to accept analytics cookies?',
        ['Yes', 'No'],
        radioButtonsContainer,
      )
    })
  }

  acceptCookies() {
    cy.get('.govuk-form-group').within(radioElement => {
      cy.wrap(radioElement).get('[type="radio"]').first().check()
    })
    cy.contains('button', 'Save cookie settings').click()
  }

  shouldHaveAcceptedCookies() {
    cy.getCookie('acceptAnalyticsCookies').should('have.property', 'value', 'true')

    cy.get('.govuk-form-group').within(radioElement => {
      cy.wrap(radioElement).get('[type="radio"]').first().should('be.checked')
    })
  }
}
