import Page from './page'

export default class AuthErrorPage extends Page {
  constructor() {
    super('Authorisation Error')
  }

  shouldContainAuthErrorMessage() {
    cy.get('[data-testid="auth-error-message"]').should(
      'contain.text',
      'You are not authorised to use this application.',
    )
  }
}
