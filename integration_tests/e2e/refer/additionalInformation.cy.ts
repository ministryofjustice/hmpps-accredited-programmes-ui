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
import { AdditionalInformationPage, TaskListPage } from '../../pages/refer'

context('Additional information', () => {
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

  it('Shows the additional information form page', () => {
    const path = referPaths.additionalInformation.show({ referralId: referral.id })
    cy.visit(path)

    const additionalInformationPage = Page.verifyOnPage(AdditionalInformationPage, { person, referral })
    additionalInformationPage.shouldHavePersonDetails(person)
    additionalInformationPage.shouldContainNavigation(path)
    additionalInformationPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    additionalInformationPage.shouldContainInstructions()
    additionalInformationPage.shouldContainAdditionalInformationTextArea()
    additionalInformationPage.shouldContainSaveAndContinueButton()
  })

  describe('When updating the additional information', () => {
    it('updates the referral and redirects to the task list', () => {
      cy.task('stubUpdateReferral', referral.id)

      const course = courseFactory.build()
      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })

      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
      const organisation = OrganisationUtils.organisationFromPrison(prison)
      cy.task('stubPrison', prison)

      const path = referPaths.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(AdditionalInformationPage, { person, referral })
      additionalInformationPage.submitAdditionalInformation()

      const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
      taskListPage.shouldHaveAdditionalInformation()
    })

    it('displays an error when additional information is not provided', () => {
      const path = referPaths.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(AdditionalInformationPage, { person, referral })
      additionalInformationPage.shouldContainButton('Save and continue').click()

      const additionalInformationPageWithError = Page.verifyOnPage(AdditionalInformationPage, { person, referral })
      additionalInformationPageWithError.shouldHaveErrors([
        {
          field: 'additionalInformation',
          message: 'Enter additional information',
        },
      ])
    })
  })
})
