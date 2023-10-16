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
  const referral = referralFactory.started().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  it('Shows the reason form page', () => {
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
      cy.task('stubUpdateReferral', referral.id)

      const course = courseFactory.build()
      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison(prison)
      cy.task('stubPrison', prison)

      const path = referPaths.reason.show({ referralId: referral.id })
      cy.visit(path)

      const reasonPage = Page.verifyOnPage(ReasonPage, { person, referral })
      reasonPage.submitReason()

      const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
      taskListPage.shouldHaveReason()
    })

    it('displays an error when the reason is not provided', () => {
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
