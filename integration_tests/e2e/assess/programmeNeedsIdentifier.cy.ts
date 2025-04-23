import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  peopleSearchResponseFactory,
  personFactory,
  pniScoreFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import ProgrammeNeedsIdentifierPage from '../../pages/assess/programmeNeedsIdentifier'

context('Viewing Programme Needs Identifier information when assessing a referral', () => {
  // Person and their PNI score
  const prisoner = peopleSearchResponseFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    name: `${prisoner.firstName} ${prisoner.lastName}`,
    prisonNumber: prisoner.prisonerNumber,
  })
  const pniScore = pniScoreFactory.build({
    prisonNumber: person.prisonNumber,
    programmePathway: 'MODERATE_INTENSITY_BC',
  })

  // Course and offering for referral
  const courseOffering = courseOfferingFactory.build()
  const course = courseFactory.build({
    courseOfferings: [courseOffering],
    intensity: 'MODERATE',
  })

  // The referral
  const referral = referralFactory.submitted().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
  })

  const pniPath = assessPaths.show.pni({ referralId: referral.id })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.signIn()

    cy.task('stubCourseByOffering', {
      course,
      courseOfferingId: courseOffering.id,
    })
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  describe('when the PNI programme pathway matches the course intensity`', () => {
    it('should show the PNI page with the correct information', () => {
      cy.task('stubPni', {
        pniScore,
        prisonNumber: person.prisonNumber,
      })

      cy.visit(pniPath)

      const pniPage = new ProgrammeNeedsIdentifierPage({ course, prisoner })
      pniPage.shouldHaveIntroText()
      pniPage.shouldNotContainOverrideInsetText()
      pniPage.shouldContainPathwayContent(pniScore.programmePathway)
    })
  })

  describe('when the PNI pathway does not match the course intensity', () => {
    it('should show the PNI page with the correct information', () => {
      pniScore.programmePathway = 'ALTERNATIVE_PATHWAY'

      cy.task('stubPni', {
        pniScore,
        prisonNumber: person.prisonNumber,
      })

      cy.visit(pniPath)

      const pniPage = new ProgrammeNeedsIdentifierPage({ course, prisoner })
      pniPage.shouldHaveIntroText()
      pniPage.shouldContainOverrideInsetText()
      pniPage.shouldContainPathwayContent(pniScore.programmePathway)
    })
  })
})
