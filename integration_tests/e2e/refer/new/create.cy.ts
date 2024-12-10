import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { findPaths, referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  userFactory,
} from '../../../../server/testutils/factories'
import { OrganisationUtils } from '../../../../server/utils'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import {
  NewReferralConfirmPersonPage,
  NewReferralDuplicatePage,
  NewReferralFindPersonPage,
  NewReferralStartPage,
  NewReferralTaskListPage,
} from '../../../pages/refer'

context('Searching for a person and creating a referral', () => {
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build({ referable: true })
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
    startReferralPage.shouldContainBackLink(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))
    startReferralPage.shouldContainHomeLink()
    startReferralPage.shouldContainOrganisationAndCourseHeading(startReferralPage)
    startReferralPage.shouldContainAudienceTag(startReferralPage.course.audienceTag)
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
      findPersonPage.shouldContainBackLink(referPaths.new.start({ courseOfferingId: courseOffering.id }))
      findPersonPage.shouldContainHomeLink()
      findPersonPage.shouldContainIdentifierForm()

      findPersonPage.searchForPerson(prisoner.prisonerNumber)

      const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, { course, courseOffering, person })
      confirmPersonPage.shouldContainBackLink(referPaths.new.new({ courseOfferingId: courseOffering.id }))
      confirmPersonPage.shouldContainHomeLink()
      confirmPersonPage.shouldContainContinueButton()
      confirmPersonPage.shouldContainDifferentIdentifierLink()
      confirmPersonPage.shouldHavePersonInformation()
      confirmPersonPage.shouldContainText('This will save a draft referral.')
    })

    describe("but the user's input is invalid", () => {
      it("displays an error when there's no prison number", () => {
        const findPersonPage = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPage.shouldContainButton('Continue').click()

        const findPersonPageWithError = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPageWithError.shouldHaveErrors([{ field: 'prisonNumber', message: 'Enter a prison number' }])
      })

      it('displays an error when the person cannot be found', () => {
        cy.task('stubPrisoner', undefined)

        const fakeId = 'NOT-A-REAL-ID'

        const findPersonPage = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPage.searchForPerson(fakeId)

        const findPersonPageWithError = Page.verifyOnPage(NewReferralFindPersonPage)
        findPersonPageWithError.shouldHaveErrors([
          { field: 'prisonNumber', message: `No person with prison number '${fakeId}' found` },
        ])
      })
    })
  })

  it("On confirming a person's details, creates a referral and redirects to the task list", () => {
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)

    const referral = referralFactory.started().build({
      offeringId: courseOffering.id,
      prisonNumber: person.prisonNumber,
      referrerUsername: auth.mockedUser.username,
    })
    cy.task('stubCreateReferral', { referral })
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

  describe('When a referral already exists for the person on the course offering', () => {
    it("On confirming a person's details, redirects to the duplicate referral page", () => {
      const referral = referralFactory.submitted().build({
        offeringId: courseOffering.id,
        prisonNumber: person.prisonNumber,
        referrerUsername: auth.mockedUser.username,
      })

      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
      cy.task('stubCreateReferral', { referral, status: 409 })
      cy.task('stubReferral', referral)
      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
      cy.task('stubUserDetails', userFactory.build({ name: 'Referring User', username: referral.referrerUsername }))
      cy.task('stubUserEmail', {
        email: 'referrer.email@test-email.co.uk',
        username: referral.referrerUsername,
        verified: true,
      })
      cy.task('stubStatusTransitions', {
        referralId: referral.id,
        statusTransitions: [],
      })

      const path = referPaths.new.people.show({
        courseOfferingId: courseOffering.id,
        prisonNumber: person.prisonNumber,
      })
      cy.visit(path)
      const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, { course, courseOffering, person })
      confirmPersonPage.confirmPerson()

      const duplicatePage = Page.verifyOnPage(NewReferralDuplicatePage, {
        course,
        courseOffering,
        organisation,
        person,
        referral,
      })
      duplicatePage.shouldContainBackLink(
        referPaths.new.people.show({ courseOfferingId: course.id, prisonNumber: person.prisonNumber }),
      )
      duplicatePage.shouldContainReferralExistsText()
      duplicatePage.shouldContainCourseOfferingSummaryList()
      duplicatePage.shouldContainSubmissionSummaryList('Referring User', 'referrer.email@test-email.co.uk')
      duplicatePage.shouldContainWarningText('You cannot create this referral while a duplicate referral is open.')
      duplicatePage.shouldContainButtonLink('Return to programme list', findPaths.index({}))
    })
  })
})
