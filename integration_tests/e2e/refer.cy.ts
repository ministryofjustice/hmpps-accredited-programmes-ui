import { findPaths, referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import auth from '../mockApis/auth'
import Page from '../pages/page'
import {
  CheckAnswersPage,
  ConfirmOasysPage,
  ConfirmPersonPage,
  FindPersonPage,
  ShowPersonPage,
  StartReferralPage,
  TaskListPage,
} from '../pages/refer'
import CompletePage from '../pages/refer/complete'

context('Refer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Shows the start page for a referral', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.start({ courseOfferingId: courseOffering.id })
    cy.visit(path)

    const startReferralPage = Page.verifyOnPage(StartReferralPage, { course, courseOffering, organisation })
    startReferralPage.shouldContainNavigation(path)
    startReferralPage.shouldContainBackLink(findPaths.offerings.show({ courseOfferingId: courseOffering.id }))
    startReferralPage.shouldContainOrganisationAndCourseHeading(startReferralPage)
    startReferralPage.shouldContainAudienceTags(startReferralPage.course.audienceTags)
    startReferralPage.shouldHaveProcessInformation()
    startReferralPage.shouldContainStartButtonLink()
  })

  describe('When searching for a person', () => {
    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prisoner = prisonerFactory.build({
      dateOfBirth: '1980-01-01',
      firstName: 'Del',
      lastName: 'Hatton',
    })

    const path = referPaths.new({ courseOfferingId: courseOffering.id })

    beforeEach(() => {
      cy.signIn()

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubCourseOffering', { courseOffering })
      cy.task('stubPrisoner', prisoner)

      cy.visit(path)
    })

    it("allows users to search for a person and confirm that person's details", () => {
      const findPersonPage = Page.verifyOnPage(FindPersonPage)
      findPersonPage.shouldContainNavigation(path)
      findPersonPage.shouldContainBackLink(referPaths.start({ courseOfferingId: courseOffering.id }))
      findPersonPage.shouldContainIdentifierForm()

      findPersonPage.searchForPerson(prisoner.prisonerNumber)

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

      const confirmPersonPage = Page.verifyOnPage(ConfirmPersonPage, { course, courseOffering, person })

      confirmPersonPage.shouldContainNavigation(path)
      confirmPersonPage.shouldContainBackLink(referPaths.new({ courseOfferingId: courseOffering.id }))
      confirmPersonPage.shouldContainContinueButton()
      confirmPersonPage.shouldContainDifferentIdentifierLink()
      confirmPersonPage.shouldHavePersonInformation()
    })

    describe("but the user's input is invalid", () => {
      it("displays an error when there's no prison number", () => {
        const findPersonPage = Page.verifyOnPage(FindPersonPage)
        findPersonPage.shouldContainButton('Continue').click()

        const findPersonPageWithError = Page.verifyOnPage(FindPersonPage)
        findPersonPageWithError.shouldHaveErrors([{ field: 'prisonNumber', message: 'Please enter a prison number' }])
      })

      it('displays an error when the person cannot be found', () => {
        const fakeId = 'NOT-A-REAL-ID'

        const findPersonPage = Page.verifyOnPage(FindPersonPage)
        findPersonPage.searchForPerson(fakeId)

        const findPersonPageWithError = Page.verifyOnPage(FindPersonPage)
        findPersonPageWithError.shouldHaveErrors([
          { field: 'prisonNumber', message: `No person with a prison number '${fakeId}' was found` },
        ])
      })
    })
  })

  it("On confirming a person's details, creates a referral and redirects to the task list", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({ name: 'Del Hatton', prisonNumber: prisoner.prisonerNumber })

    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

    const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubCreateReferral', referral)
    cy.task('stubReferral', referral)

    const path = referPaths.people.show({
      courseOfferingId: courseOffering.id,
      prisonNumber: person.prisonNumber,
    })
    cy.visit(path)
    const confirmPersonPage = Page.verifyOnPage(ConfirmPersonPage, { course, courseOffering, person })
    confirmPersonPage.confirmPerson()

    Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
  })

  it('Shows the in-progress referral task list', () => {
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

    const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.show({ referralId: referral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
    taskListPage.shouldHavePersonDetails(person)
    taskListPage.shouldContainNavigation(path)
    taskListPage.shouldContainBackLink('#')
    taskListPage.shouldContainOrganisationAndCourseHeading(taskListPage)
    taskListPage.shouldContainAudienceTags(taskListPage.course.audienceTags)
    taskListPage.shouldContainTaskList()
    taskListPage.shouldNotBeReadyForSubmission()
  })

  it('Shows the person page for a referral', () => {
    cy.signIn()

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

    const referral = referralFactory.build({ prisonNumber: prisoner.prisonerNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.showPerson({ referralId: referral.id })
    cy.visit(path)

    const showPersonPage = Page.verifyOnPage(ShowPersonPage, { person })
    showPersonPage.shouldHavePersonDetails(person)
    showPersonPage.shouldContainNavigation(path)
    showPersonPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    showPersonPage.shouldContainPersonSummaryList(person)
  })

  it('Shows the confirm OASys form page', () => {
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

    const referral = referralFactory.build({ prisonNumber: person.prisonNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.confirmOasys({ referralId: referral.id })
    cy.visit(path)

    const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
    confirmOasysPage.shouldHavePersonDetails(person)
    confirmOasysPage.shouldContainNavigation(path)
    confirmOasysPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    confirmOasysPage.shouldContainImportanceDetails()
    confirmOasysPage.shouldContainLastUpdatedNotificationBanner()
    confirmOasysPage.shouldContainConfirmationCheckbox()
    confirmOasysPage.shouldContainSaveAndContinueButton()
  })

  it('On confirming OASys information, updates the referral and redirects to the task list', () => {
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

    const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubUpdateReferral', referral.id)

    const path = referPaths.confirmOasys({ referralId: referral.id })
    cy.visit(path)

    const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
    confirmOasysPage.confirmOasys()

    const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
    taskListPage.shouldHaveConfirmedOasys()
  })

  it('Links to the check answers page when the referral is ready for submission', () => {
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

    const referral = referralFactory.build({
      oasysConfirmed: true,
      offeringId: courseOffering.id,
      prisonNumber: person.prisonNumber,
    })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.show({ referralId: referral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
    taskListPage.shouldBeReadyForSubmission()
  })

  it('Shows the correct information on the Check answers and submit task page', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

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

    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

    const referral = referralFactory.build({
      oasysConfirmed: true,
      offeringId: courseOffering.id,
      prisonNumber: person.prisonNumber,
    })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.checkAnswers({ referralId: referral.id })
    cy.visit(path)

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
      course,
      courseOffering,
      organisation,
      person,
      username: auth.mockedUsername(),
    })

    checkAnswersPage.shouldHavePersonDetails(person)
    checkAnswersPage.shouldContainNavigation(path)
    checkAnswersPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    checkAnswersPage.shouldHaveApplicationSummary()
    checkAnswersPage.shouldContainPersonSummaryList(person)
    checkAnswersPage.shouldHaveConfirmationCheckbox()
    checkAnswersPage.shouldContainButton('Submit referral')
    checkAnswersPage.shouldContainButtonLink('Return to tasklist', referPaths.show({ referralId: referral.id }))
  })

  it('Shows the complete page for a completed referral', () => {
    cy.signIn()

    const referral = referralFactory.build({ status: 'referral_submitted' })

    cy.task('stubReferral', referral)

    const path = referPaths.complete({ referralId: referral.id })
    cy.visit(path)

    const completePage = Page.verifyOnPage(CompletePage)
    completePage.shouldContainPanel('Referral complete')
  })

  describe('Submitting a referral', () => {
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

    beforeEach(() => {
      cy.signIn()

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
    })

    it('redirects to the referral complete page when the user confirms the details', () => {
      const referral = referralFactory.build({
        oasysConfirmed: true,
        offeringId: courseOffering.id,
        prisonNumber: person.prisonNumber,
      })

      cy.task('stubReferral', referral)
      cy.task('stubUpdateReferralStatus', referral.id)

      const path = referPaths.checkAnswers({ referralId: referral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        person,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.confirmDetailsAndSubmitReferral(referral)

      const completePage = Page.verifyOnPage(CompletePage)
      completePage.shouldContainPanel('Referral complete')
    })

    it('shows an error when the user tries to submit a referral without confirming the details', () => {
      const referral = referralFactory.build({
        oasysConfirmed: true,
        offeringId: courseOffering.id,
        prisonNumber: person.prisonNumber,
      })

      cy.task('stubReferral', referral)

      const path = referPaths.checkAnswers({ referralId: referral.id })
      cy.visit(path)

      const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        person,
        username: auth.mockedUsername(),
      })
      checkAnswersPage.shouldContainButton('Submit referral').click()

      const checkAnswersPageWithErrors = Page.verifyOnPage(CheckAnswersPage, {
        course,
        courseOffering,
        organisation,
        person,
        username: auth.mockedUsername(),
      })
      checkAnswersPageWithErrors.shouldContainErrorSummary([
        {
          href: '#confirmation',
          text: 'Please confirm that the information you have provided is complete, accurate and up to date',
        },
      ])
    })
  })
})
