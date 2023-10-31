import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { findPaths, referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../../../server/testutils/factories'
import { OrganisationUtils } from '../../../../server/utils'
import Page from '../../../pages/page'
import {
  NewReferralConfirmPersonPage,
  NewReferralFindPersonPage,
  NewReferralStartPage,
  NewReferralTaskListPage,
} from '../../../pages/refer'

context('Searching for a person and creating a referral', () => {
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build()
  const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
  const organisation = OrganisationUtils.organisationFromPrison(prison)
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

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
  })

  it('Shows the start page for a referral', () => {
    cy.task('stubPrison', prison)

    const path = referPaths.new.start({ courseOfferingId: courseOffering.id })
    cy.visit(path)

    const startReferralPage = Page.verifyOnPage(NewReferralStartPage, { course, courseOffering, organisation })
    startReferralPage.shouldContainNavigation(path)
    startReferralPage.shouldContainBackLink(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))
    startReferralPage.shouldContainOrganisationAndCourseHeading(startReferralPage)
    startReferralPage.shouldContainAudienceTags(startReferralPage.course.audienceTags)
    startReferralPage.shouldHaveProcessInformation()
    startReferralPage.shouldContainStartButtonLink()
  })

  describe('When searching for a person', () => {
    const path = referPaths.new.new({ courseOfferingId: courseOffering.id })

    beforeEach(() => {
      cy.task('stubPrisoner', prisoner)

      cy.visit(path)
    })

    it("allows users to search for a person and confirm that person's details", () => {
      const findPersonPage = Page.verifyOnPage(NewReferralFindPersonPage)
      findPersonPage.shouldContainNavigation(path)
      findPersonPage.shouldContainBackLink(referPaths.new.start({ courseOfferingId: courseOffering.id }))
      findPersonPage.shouldContainIdentifierForm()

      findPersonPage.searchForPerson(prisoner.prisonerNumber)

      const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, { course, courseOffering, person })

      confirmPersonPage.shouldContainNavigation(path)
      confirmPersonPage.shouldContainBackLink(referPaths.new.new({ courseOfferingId: courseOffering.id }))
      confirmPersonPage.shouldContainContinueButton()
      confirmPersonPage.shouldContainDifferentIdentifierLink()
      confirmPersonPage.shouldHavePersonInformation()
    })

    describe("but the user's input is invalid", () => {
      it("displays an error when there's no prison number", () => {
        const findPersonPage = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPage.shouldContainButton('Continue').click()

        const findPersonPageWithError = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPageWithError.shouldHaveErrors([{ field: 'prisonNumber', message: 'Please enter a prison number' }])
      })

      it('displays an error when the person cannot be found', () => {
        cy.task('stubPrisoner', undefined)

        const fakeId = 'NOT-A-REAL-ID'

        const findPersonPage = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPage.searchForPerson(fakeId)

        const findPersonPageWithError = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPageWithError.shouldHaveErrors([
          { field: 'prisonNumber', message: `No person with a prison number '${fakeId}' was found` },
        ])
      })
    })
  })

  it("On confirming a person's details, creates a referral and redirects to the task list", () => {
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)

    const referral = referralFactory
      .started()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
    cy.task('stubCreateReferral', referral)
    cy.task('stubReferral', referral)

    const path = referPaths.new.people.show({
      courseOfferingId: courseOffering.id,
      prisonNumber: person.prisonNumber,
    })
    cy.visit(path)
    const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, { course, courseOffering, person })
    confirmPersonPage.confirmPerson()

    Page.verifyOnPage(NewReferralTaskListPage, { course, courseOffering, organisation, referral })
  })
})
