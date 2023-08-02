import CookiePolicyPage from '../pages/cookiePolicy'
import Page from '../pages/page'

context('Cookies', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  context("When a user's analytics cookie preferences have not been saved", () => {
    it('Allows users to accept cookies, then hides the banner when requested', () => {
      cy.signIn()

      cy.get('.govuk-cookie-banner__heading').should('contain', 'Cookies on Refer and monitor an intervention')

      cy.get('.govuk-cookie-banner').contains('button', 'Accept analytics cookies').click()

      cy.getCookie('acceptAnalyticsCookies').should('have.property', 'value', 'true')

      cy.get('.govuk-cookie-banner')
        .should('contain', 'You’ve accepted additional cookies')
        .contains('a', 'Hide cookie message')
        .click()

      cy.get('.govuk-cookie-banner').should('not.exist')
    })

    it('Allows users to reject cookies, then hides the banner when requested', () => {
      cy.signIn()

      cy.get('.govuk-cookie-banner__heading').should('contain', 'Cookies on Refer and monitor an intervention')

      cy.get('.govuk-cookie-banner').contains('button', 'Reject analytics cookies').click()

      cy.getCookie('acceptAnalyticsCookies').should('have.property', 'value', 'false')

      cy.get('.govuk-cookie-banner')
        .should('contain', 'You’ve rejected additional cookies')
        .contains('a', 'Hide cookie message')
        .click()

      cy.get('.govuk-cookie-banner').should('not.exist')
    })
  })

  context("When a user's analytics cookie preferences have already been saved", () => {
    it('Does not show a cookie banner', () => {
      cy.setCookie('acceptAnalyticsCookies', 'true')
      cy.signIn()

      cy.get('.govuk-cookie-banner').should('not.exist')
    })
  })

  context('Viewing the cookie policy page', () => {
    it('Allows users to view the cookie policy page and update their cookies', () => {
      cy.signIn()

      cy.contains('a', 'Cookies').click()

      const cookiePolicyPage = Page.verifyOnPage(CookiePolicyPage)

      cookiePolicyPage.shouldNotContainCookieBanner()
      cookiePolicyPage.shouldContainCookieSettingRadioButtons()
      cookiePolicyPage.acceptCookies()
      cookiePolicyPage.shouldHaveAcceptedCookies()
    })
  })
})
