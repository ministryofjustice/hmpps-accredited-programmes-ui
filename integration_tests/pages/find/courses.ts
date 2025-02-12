import { findPaths } from '../../../server/paths'
import Page from '../page'

export default class CoursesPage extends Page {
  constructor() {
    super('Find an Accredited Programme', { hideTitleServiceName: true })
  }

  shouldContainAddNewProgrammeLink() {
    cy.get('[data-testid="add-programme-link"]')
      .should('contain.text', 'Add a new programme')
      .and('have.attr', 'href', findPaths.course.add.show({}))
  }

  shouldNotContainAddNewProgrammeLink() {
    cy.get('[data-testid="add-programme-link"]').should('not.exist')
  }
}
