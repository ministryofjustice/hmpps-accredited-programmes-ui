import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Accredited Programmes')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  findLink = (): PageElement => cy.get('[href="/programmes"]')
}
