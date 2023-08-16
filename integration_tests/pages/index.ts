import type { PageElement } from './page'
import Page from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Accredited Programmes', { customPageTitleEnd: 'Home' })
  }

  findLink = (): PageElement => cy.get('[href="/programmes"]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
