import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import { OrganisationUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { ReasonPage, TaskListPage } from '../../pages/refer'

context('Reason', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  it('Shows the reason form page', () => {
    cy.signIn()

    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({
      currentPrison: prisoner.prisonName,
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
    })

    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.reason.show({ referralId: referral.id })
    cy.visit(path)

    const reasonPage = Page.verifyOnPage(ReasonPage, { person, referral })
    reasonPage.shouldHavePersonDetails(person)
    reasonPage.shouldContainNavigation(path)
    reasonPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    reasonPage.shouldContainInformationTypeDetails()
    reasonPage.shouldContainReasonTextArea()
    reasonPage.shouldContainSaveAndContinueButton()
  })

  describe('When updating the reason', () => {
    it('updates the referral and redirects to the task list', () => {
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()

      const prisoner = prisonerFactory.build({
        firstName: 'Del',
        lastName: 'Hatton',
      })
      const person = personFactory.build({
        currentPrison: prisoner.prisonName,
        name: 'Del Hatton',
        prisonNumber: prisoner.prisonerNumber,
      })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

      const referral = referralFactory
        .started()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)
      cy.task('stubUpdateReferral', referral.id)

      const path = referPaths.reason.show({ referralId: referral.id })
      cy.visit(path)

      const reasonPage = Page.verifyOnPage(ReasonPage, { person, referral })
      reasonPage.submitReason()

      const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
      taskListPage.shouldHaveReason()
    })

    it('displays an error when the reason is not provided', () => {
      cy.signIn()

      const prisoner = prisonerFactory.build({
        firstName: 'Del',
        lastName: 'Hatton',
      })
      const person = personFactory.build({
        currentPrison: prisoner.prisonName,
        name: 'Del Hatton',
        prisonNumber: prisoner.prisonerNumber,
      })

      const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)

      const path = referPaths.reason.show({ referralId: referral.id })
      cy.visit(path)

      const reasonPage = Page.verifyOnPage(ReasonPage, { person, referral })
      reasonPage.shouldContainButton('Save and continue').click()

      const reasonPageWithError = Page.verifyOnPage(ReasonPage, { person, referral })
      reasonPageWithError.shouldHaveErrors([
        {
          field: 'reason',
          message: 'Enter a reason for the referral',
        },
      ])
    })
  })
})
