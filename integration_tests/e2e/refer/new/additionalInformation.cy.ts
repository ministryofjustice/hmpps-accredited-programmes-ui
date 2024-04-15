import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../../../server/testutils/factories'
import { OrganisationUtils } from '../../../../server/utils'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import { NewReferralAdditionalInformationPage, NewReferralTaskListPage } from '../../../pages/refer'

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
  const referral = referralFactory.started().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: auth.mockedUser.username,
  })

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
    const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
    cy.visit(path)

    const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
    additionalInformationPage.shouldHavePersonDetails(person)
    additionalInformationPage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
    additionalInformationPage.shouldContainHomeLink()
    additionalInformationPage.shouldContainInstructions()
    additionalInformationPage.shouldContainAdditionalInformationTextArea()
    additionalInformationPage.shouldContainWarningText(
      'This service will provide the relevant sections from OASys that the programme team needs to assess this referral. The programme team may also need to access the full OASys Layer 3.',
    )
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

      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.submitAdditionalInformation()

      const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
        course,
        courseOffering,
        organisation,
        referral,
      })
      taskListPage.shouldHaveAdditionalInformation()
    })

    it('displays an error when additional information is not provided', () => {
      const path = referPaths.new.additionalInformation.show({ referralId: referral.id })
      cy.visit(path)

      const additionalInformationPage = Page.verifyOnPage(NewReferralAdditionalInformationPage, { person, referral })
      additionalInformationPage.shouldContainButton('Save and continue').click()

      const additionalInformationPageWithError = Page.verifyOnPage(NewReferralAdditionalInformationPage, {
        person,
        referral,
      })
      additionalInformationPageWithError.shouldHaveErrors([
        {
          field: 'additionalInformation',
          message: 'Enter additional information',
        },
      ])
    })
  })
})
