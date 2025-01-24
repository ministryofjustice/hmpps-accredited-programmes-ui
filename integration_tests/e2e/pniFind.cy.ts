import { findPaths } from '../../server/paths'
import { prisonerFactory } from '../../server/testutils/factories'
import { PersonSearchPage } from '../pages/find'
import Page from '../pages/page'

context('Find programmes based on PNI Pathway', () => {
  const personSearchPath = findPaths.pniFind.personSearch.pattern

  describe('For any user', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.signIn()
    })

    it('Shows the person search page', () => {
      cy.visit(personSearchPath)

      const personSearchPage = Page.verifyOnPage(PersonSearchPage)
      personSearchPage.shouldContainPersonSearchInput()
      personSearchPage.shouldContainButton('Continue')
    })

    describe('When submitting without a prison number', () => {
      it('Shows an error message', () => {
        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.shouldContainButton('Continue').click()
        personSearchPage.shouldHaveErrors([
          {
            field: 'prisonNumber',
            message: 'Enter a prison number',
          },
        ])
      })
    })

    describe('When submitting with a prison number but it cannot be found', () => {
      it('Shows an error message', () => {
        const enteredPrisonNumber = 'FAKEID'

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(enteredPrisonNumber)
        personSearchPage.shouldHaveErrors([
          {
            field: 'prisonNumber',
            message: `No person with prison number '${enteredPrisonNumber}' found`,
          },
        ])
      })
    })

    describe('When submitting with a prison number that can be found', () => {
      it('Redirects to the recommended pathway page', () => {
        const prisonNumber = 'A1234AA'
        const prisoner = prisonerFactory.build({
          dateOfBirth: '1980-01-01',
          firstName: 'Del',
          lastName: 'Hatton',
          prisonerNumber: prisonNumber,
        })

        cy.task('stubPrisoner', prisoner)

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        cy.url().should('include', findPaths.pniFind.recommendedPathway.pattern)
      })
    })
  })
})
