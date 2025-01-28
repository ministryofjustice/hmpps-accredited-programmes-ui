import { findPaths } from '../../server/paths'
import { pniScoreFactory, prisonerFactory } from '../../server/testutils/factories'
import { PersonSearchPage, RecommendedPathwayPage } from '../pages/find'
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
      const prisonNumber = 'A1234AA'
      const prisoner = prisonerFactory.build({
        dateOfBirth: '1980-01-01',
        firstName: 'Del',
        lastName: 'Hatton',
        prisonerNumber: prisonNumber,
      })

      beforeEach(() => {
        cy.task('stubPrisoner', prisoner)
      })

      it('shows the correct content for a `HIGH_INTENSITY_BC` pathway', () => {
        const pniScore = pniScoreFactory.build({
          programmePathway: 'HIGH_INTENSITY_BC',
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch.pattern)
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('How is this calculated?')
        recommendedPathwayPage.shouldContainButtonLink(
          'Select a programme',
          findPaths.pniFind.recommenedProgrammes.pattern,
        )
      })

      it('shows the correct content for a `MODERATE_INTENSITY_BC` pathway', () => {
        const pniScore = pniScoreFactory.build({
          programmePathway: 'MODERATE_INTENSITY_BC',
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch.pattern)
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('How is this calculated?')
        recommendedPathwayPage.shouldContainButtonLink(
          'Select a programme',
          findPaths.pniFind.recommenedProgrammes.pattern,
        )
      })

      it('shows the correct content for an "ALTERNATIVE_PATHWAY" pathway', () => {
        const pniScore = pniScoreFactory.build({
          programmePathway: 'ALTERNATIVE_PATHWAY',
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch.pattern)
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('How is this calculated?')
        recommendedPathwayPage.shouldContainStillMakeReferralHeading()
        recommendedPathwayPage.shouldContainNotEligibleStillMakeReferralText()
        recommendedPathwayPage.shouldContainButtonLink(
          'See all programmes',
          findPaths.pniFind.recommenedProgrammes.pattern,
        )
        recommendedPathwayPage.shouldContainLink('Cancel', findPaths.pniFind.personSearch.pattern)
      })

      it('shows the correct content for a "MISSING_INFORMATION" pathway', () => {
        const pniScore = pniScoreFactory.build({
          programmePathway: 'MISSING_INFORMATION',
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch.pattern)
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('What information is missing')
        recommendedPathwayPage.shouldContainButtonLink(
          'See all programmes',
          findPaths.pniFind.recommenedProgrammes.pattern,
        )
        recommendedPathwayPage.shouldContainLink('Cancel', findPaths.pniFind.personSearch.pattern)
      })

      it('shows the correct content when there is no programme pathway', () => {
        cy.task('stubPni', { pniScore: null, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch.pattern)
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent('MISSING_INFORMATION')
        recommendedPathwayPage.shouldContainStillMakeReferralHeading()
        recommendedPathwayPage.shouldContainAllInformationMissingStillMakeReferralText()
        recommendedPathwayPage.shouldContainButtonLink(
          'See all programmes',
          findPaths.pniFind.recommenedProgrammes.pattern,
        )
        recommendedPathwayPage.shouldContainLink('Cancel', findPaths.pniFind.personSearch.pattern)
      })
    })
  })
})
