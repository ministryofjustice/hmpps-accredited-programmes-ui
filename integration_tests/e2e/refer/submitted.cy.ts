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
import { CourseUtils, OrganisationUtils } from '../../../server/utils'
import Page from '../../pages/page'
import { SubmittedPersonalDetailsPage } from '../../pages/refer'

context('Viewing a submitted referral', () => {
  const course = courseFactory.build()
  const coursePresenter = CourseUtils.presentCourse(course)
  const courseOffering = courseOfferingFactory.build()
  const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
  const prisoner = prisonerFactory.build({
    dateOfBirth: '1980-01-01',
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    dateOfBirth: '1 January 1980',
    ethnicity: prisoner.ethnicity,
    gender: prisoner.gender,
    name: 'Del Hatton',
    prisonNumber: prisoner.prisonerNumber,
    religionOrBelief: prisoner.religion,
    setting: 'Custody',
  })
  const referral = referralFactory.submitted().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
  })
  const organisation = OrganisationUtils.organisationFromPrison(prison)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  describe('When reviewing personal details', () => {
    it('shows the correct information', () => {
      const path = referPaths.submitted.personalDetails({ referralId: referral.id })

      cy.visit(path)

      const submittedPersonalDetailsPage = Page.verifyOnPage(SubmittedPersonalDetailsPage, {
        course,
        organisation,
        referral,
      })
      submittedPersonalDetailsPage.shouldHavePersonDetails(person)
      submittedPersonalDetailsPage.shouldContainNavigation(path)
      submittedPersonalDetailsPage.shouldContainBackLink('#')
      submittedPersonalDetailsPage.shouldContainCourseOfferingSummaryList(coursePresenter, organisation.name)
      submittedPersonalDetailsPage.shouldContainSideNavigation(path)
      submittedPersonalDetailsPage.shouldContainImportedFromText()
      submittedPersonalDetailsPage.shouldContainPersonSummaryList(person)
    })
  })
})
