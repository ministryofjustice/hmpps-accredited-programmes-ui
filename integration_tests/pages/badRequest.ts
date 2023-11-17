import Page from './page'

export default class BadRequestPage extends Page {
  constructor(args: { errorMessage: string }) {
    super(args.errorMessage, { customPageTitleEnd: 'Error' })
  }

  shouldContain400Heading() {
    cy.get('h2').should('contain.text', '400')
  }
}
