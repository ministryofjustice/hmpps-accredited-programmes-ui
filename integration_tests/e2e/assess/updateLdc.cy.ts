import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import { peopleSearchResponseFactory, personFactory, referralFactory } from '../../../server/testutils/factories'
import UpdateLdcPage from '../../pages/assess/updateLdc'
import Page from '../../pages/page'

context('Updating a persons LDC status for a referral', () => {
  const prisoner = peopleSearchResponseFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    name: `${prisoner.firstName} ${prisoner.lastName}`,
    prisonNumber: prisoner.prisonerNumber,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
  })

  describe('when referral.hasLdc is true', () => {
    it('should show the correct content', () => {
      const referralWithLdc = referralFactory.submitted().build({
        hasLdc: true,
        prisonNumber: person.prisonNumber,
      })
      const referralDetailsPath = assessPaths.show.personalDetails({ referralId: referralWithLdc.id })

      cy.task('stubReferral', referralWithLdc)

      cy.visit(assessPaths.updateLdc.show({ referralId: referralWithLdc.id }))

      const updateLdcPage = Page.verifyOnPage(UpdateLdcPage, {
        person,
      })
      updateLdcPage.shouldHavePersonDetails(person)
      updateLdcPage.shouldContainBackLink(referralDetailsPath)
      updateLdcPage.shouldContainHasLdcContent()
      updateLdcPage.shouldContainButton('Submit')
      updateLdcPage.shouldContainLink('Cancel', referralDetailsPath)
    })
  })

  describe('when referral.hasLdc is false', () => {
    it('should show the correct content', () => {
      const referralWithoutLdc = referralFactory.submitted().build({
        hasLdc: false,
        prisonNumber: person.prisonNumber,
      })
      const referralDetailsPath = assessPaths.show.personalDetails({ referralId: referralWithoutLdc.id })

      cy.task('stubReferral', referralWithoutLdc)

      cy.visit(assessPaths.updateLdc.show({ referralId: referralWithoutLdc.id }))

      const updateLdcPage = Page.verifyOnPage(UpdateLdcPage, {
        person,
      })
      updateLdcPage.shouldHavePersonDetails(person)
      updateLdcPage.shouldContainBackLink(referralDetailsPath)
      updateLdcPage.shouldContainNoLdcContent()
      updateLdcPage.shouldContainButton('Submit')
      updateLdcPage.shouldContainLink('Cancel', referralDetailsPath)
    })
  })
})
