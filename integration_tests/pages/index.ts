import type { PageElement } from './page'
import Page from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Accredited Programmes: find and refer', { pageTitleOverride: 'Accredited Programmes service' })
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
