import Page from './page'

export default class NotFoundPage extends Page {
  constructor() {
    super('Not Found', {
      customPageTitleEnd: 'Error',
    })
  }

  shouldContain404H2() {
    cy.get('h2').should('have.text', '404')
  }
}
