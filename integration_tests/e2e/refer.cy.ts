import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { findPaths, referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import auth from '../mockApis/auth'
import AuthErrorPage from '../pages/authError'
import Page from '../pages/page'
import {
  CheckAnswersPage,
  ConfirmOasysPage,
  ConfirmPersonPage,
  FindPersonPage,
  ProgrammeHistoryDetailsPage,
  ProgrammeHistoryPage,
  SelectProgrammePage,
  ShowPersonPage,
  StartReferralPage,
  TaskListPage,
} from '../pages/refer'
import CompletePage from '../pages/refer/complete'
import ReasonPage from '../pages/refer/reason'
import type { CourseParticipation, CourseParticipationWithName } from '@accredited-programmes/models'

context('Refer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  it('Shows the start page for a referral', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
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
      cy.task('stubOffering', { courseOffering })
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
        cy.task('stubPrisoner', undefined)
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

    const referral = referralFactory
      .started()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
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

    const referral = referralFactory
      .started()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
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

    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })

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

    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.confirmOasys.show({ referralId: referral.id })
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

  describe('When confirming OASys information', () => {
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

      const path = referPaths.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
      confirmOasysPage.confirmOasys()

      const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation, referral })
      taskListPage.shouldHaveConfirmedOasys()
    })

    it('displays an error when the checkbox is not checked', () => {
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

      const path = referPaths.confirmOasys.show({ referralId: referral.id })
      cy.visit(path)

      const confirmOasysPage = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
      confirmOasysPage.shouldContainButton('Save and continue').click()

      const confirmOasysPageWithError = Page.verifyOnPage(ConfirmOasysPage, { person, referral })
      confirmOasysPageWithError.shouldHaveErrors([
        {
          field: 'oasysConfirmed',
          message: 'Confirm the OASys information is up to date',
        },
      ])
    })
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

  describe('Showing the programme history page', () => {
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

    const course = courseFactory.build()

    const courseParticipations = [
      courseParticipationFactory.withCourseId().build({ courseId: course.id }),
      courseParticipationFactory.withOtherCourseName().build({ otherCourseName: 'A great course name' }),
    ]
    const courseParticipationsWithNames: Array<CourseParticipationWithName> = [
      { ...courseParticipations[0], name: course.name },
      {
        ...courseParticipations[1],
        name: courseParticipations[1].otherCourseName as CourseParticipationWithName['name'],
      },
    ]

    const path = referPaths.programmeHistory.index({ referralId: referral.id })

    beforeEach(() => {
      cy.signIn()

      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)
      cy.task('stubCourse', course)
    })

    it('shows the page with an existing programme history', () => {
      cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })

      cy.visit(path)

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        participationsWithNames: courseParticipationsWithNames,
        person,
        referral,
      })
      programmeHistoryPage.shouldHavePersonDetails(person)
      programmeHistoryPage.shouldContainNavigation(path)
      programmeHistoryPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
      programmeHistoryPage.shouldContainPreHistoryParagraph()
      programmeHistoryPage.shouldContainHistorySummaryCards()
      programmeHistoryPage.shouldContainButton('Continue')
      programmeHistoryPage.shouldContainButtonLink(
        'Add another',
        referPaths.programmeHistory.new({ referralId: referral.id }),
      )
    })

    it('shows the page without an existing programme history', () => {
      const emptyCourseParticipations: Array<CourseParticipation> = []
      cy.task('stubParticipationsByPerson', {
        courseParticipations: emptyCourseParticipations,
        prisonNumber: prisoner.prisonerNumber,
      })

      cy.visit(path)

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        participationsWithNames: emptyCourseParticipations as Array<CourseParticipationWithName>,
        person,
        referral,
      })
      programmeHistoryPage.shouldHavePersonDetails(person)
      programmeHistoryPage.shouldContainNavigation(path)
      programmeHistoryPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
      programmeHistoryPage.shouldContainNoHistoryHeading()
      programmeHistoryPage.shouldContainNoHistoryParagraph()
      programmeHistoryPage.shouldContainButton('Continue')
      programmeHistoryPage.shouldContainButtonLink(
        'Add a programme',
        referPaths.programmeHistory.new({ referralId: referral.id }),
      )
    })
  })

  describe('When adding programme history', () => {
    const courses = courseFactory.buildList(4)
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

    describe('and selecting a programme', () => {
      const path = referPaths.programmeHistory.new({ referralId: referral.id })

      beforeEach(() => {
        cy.task('stubCourses', courses)
        cy.task('stubPrisoner', prisoner)
        cy.task('stubReferral', referral)

        cy.signIn()

        cy.visit(path)
      })

      it('shows the select programme form page', () => {
        const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
        selectProgrammePage.shouldHavePersonDetails(person)
        selectProgrammePage.shouldContainNavigation(path)
        selectProgrammePage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
        selectProgrammePage.shouldContainCourseOptions()
        selectProgrammePage.shouldNotDisplayOtherCourseInput()
        selectProgrammePage.shouldDisplayOtherCourseInput()
        selectProgrammePage.shouldContainButton('Continue')
      })

      it('creates a course participation and redirects to the details page', () => {
        const courseParticipation = courseParticipationFactory
          .withCourseId()
          .build({ courseId: courses[0].id, prisonNumber: person.prisonNumber })

        cy.task('stubCreateParticipation', courseParticipation)

        const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
        selectProgrammePage.selectCourse(courses[0].id)
        selectProgrammePage.submitSelection(courseParticipation, courses[0].id)

        Page.verifyOnPage(ProgrammeHistoryDetailsPage)
      })

      it('displays an error when no programme is selected', () => {
        const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
        selectProgrammePage.shouldContainButton('Continue').click()

        const selectProgrammePageWithError = Page.verifyOnPage(SelectProgrammePage, { courses })
        selectProgrammePageWithError.shouldHaveErrors([
          {
            field: 'courseId',
            message: 'Select a programme',
          },
        ])
      })

      it('displays an error when the other programme name is not provided', () => {
        const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
        selectProgrammePage.selectCourse('other')
        selectProgrammePage.shouldContainButton('Continue').click()

        const selectProgrammePageWithError = Page.verifyOnPage(SelectProgrammePage, { courses })
        selectProgrammePageWithError.shouldHaveErrors([
          {
            field: 'otherCourseName',
            message: 'Enter the programme name',
          },
        ])
      })
    })

    describe('and a programme has been selected', () => {
      const courseParticipation = courseParticipationFactory
        .withCourseId()
        .build({ courseId: courses[0].id, prisonNumber: person.prisonNumber })
      const path = referPaths.programmeHistory.details({
        courseParticipationId: courseParticipation.id,
        referralId: referral.id,
      })

      beforeEach(() => {
        cy.task('stubParticipation', courseParticipation)
        cy.task('stubPrisoner', prisoner)
        cy.task('stubReferral', referral)

        cy.signIn()

        cy.visit(path)
      })

      it('shows the details form page', () => {
        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPage.shouldContainNavigation(path)
        programmeHistoryDetailsPage.shouldHavePersonDetails(person)
        programmeHistoryDetailsPage.shouldContainBackLink(
          referPaths.programmeHistory.index({ referralId: referral.id }),
        )
        programmeHistoryDetailsPage.shouldContainSettingRadioItems()
        programmeHistoryDetailsPage.shouldNotDisplayCommunityLocationInput()
        programmeHistoryDetailsPage.shouldDisplayCommunityLocationInput()
        programmeHistoryDetailsPage.shouldNotDisplayCustodyLocationInput()
        programmeHistoryDetailsPage.shouldDisplayCustodyLocationInput()
        programmeHistoryDetailsPage.shouldContainOutcomeRadioItems()
        programmeHistoryDetailsPage.shouldNotDisplayYearCompletedInput()
        programmeHistoryDetailsPage.shouldDisplayYearCompletedInput()
        programmeHistoryDetailsPage.shouldNotDisplayYearStartedInput()
        programmeHistoryDetailsPage.shouldDisplayYearStartedInput()
        programmeHistoryDetailsPage.shouldContainOutcomeDetailTextArea()
        programmeHistoryDetailsPage.shouldContainSourceTextArea()
        programmeHistoryDetailsPage.shouldContainButton('Continue')
      })
    })
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

    const referral = referralFactory
      .submittable()
      .build({ oasysConfirmed: true, offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
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

    const referral = referralFactory
      .submittable()
      .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
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
    checkAnswersPage.shouldHaveOasysConfirmation()
    checkAnswersPage.shouldHaveAdditionalInformation(referral)
    checkAnswersPage.shouldHaveConfirmationCheckbox()
    checkAnswersPage.shouldContainButton('Submit referral')
    checkAnswersPage.shouldContainButtonLink('Return to tasklist', referPaths.show({ referralId: referral.id }))
  })

  describe('When submitting a referral', () => {
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
      cy.task('stubOffering', { courseId: course.id, courseOffering })
      cy.task('stubPrison', prison)
      cy.task('stubPrisoner', prisoner)
    })

    it('redirects to the referral complete page when the user confirms the details', () => {
      const referral = referralFactory
        .submittable()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

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
      const referral = referralFactory
        .submittable()
        .build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

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
      checkAnswersPageWithErrors.shouldHaveErrors([
        {
          field: 'confirmation',
          message: 'Confirm that the information you have provided is complete, accurate and up to date',
        },
      ])
    })
  })

  it('Shows the complete page for a completed referral', () => {
    cy.signIn()

    const referral = referralFactory.submitted().build({ status: 'referral_submitted' })

    cy.task('stubReferral', referral)

    const path = referPaths.complete({ referralId: referral.id })
    cy.visit(path)

    const completePage = Page.verifyOnPage(CompletePage)
    completePage.shouldContainPanel('Referral complete')
  })

  describe('When the user does not have the `ROLE_ACP_REFERRER` role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [] })
      cy.task('stubAuthUser')
      cy.task('stubDefaultCaseloads')
    })

    it('shows the authentication error page', () => {
      cy.signIn()

      const course = courseFactory.build()
      const courseOffering = courseOfferingFactory.build()
      const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })

      cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
      cy.task('stubPrison', prison)

      const path = referPaths.start({ courseOfferingId: courseOffering.id })
      cy.visit(path, { failOnStatusCode: false })

      const authErrorPage = Page.verifyOnPage(AuthErrorPage)
      authErrorPage.shouldContainAuthErrorMessage()
    })
  })
})
