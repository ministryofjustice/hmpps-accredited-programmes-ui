import type { PageElement } from './page'
import Page from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Accredited Programmes', 'Home')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  findLink = (): PageElement => cy.get('[href="/programmes"]')
}
