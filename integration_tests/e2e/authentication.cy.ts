import AuthSignInPage from '../pages/authSignIn'
import IndexPage from '../pages/index'
import Page from '../pages/page'

context('Authentication', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')

    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')

    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('Redirects signed in users to a landing page', () => {
    cy.signIn()

    Page.verifyOnPage(IndexPage)
  })

  it('User can log out', () => {
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()

    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()

    Page.verifyOnPage(IndexPage)

    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()

    const indexPage = Page.verifyOnPage(IndexPage)

    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubAuthUser', 'bobby brown')

    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
  })
})
