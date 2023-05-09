import ProgrammesPage from '../pages/find/programmes'
import Page from '../pages/page'
import { programmeFactory } from '../../server/testutils/factories'

context('Find', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Shows a list of all programmes', () => {
    cy.signIn()

    const programmes = programmeFactory.buildList(4)

    cy.task('stubProgrammes', programmes)

    cy.visit('/programmes')

    const programmesPage = Page.verifyOnPage(ProgrammesPage)
    programmesPage.shouldHaveProgrammes(programmes)
  })
})
