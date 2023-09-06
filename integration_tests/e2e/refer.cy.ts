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
import { CheckAnswersPage, ConfirmPersonPage, FindPersonPage, StartReferralPage, TaskListPage } from '../pages/refer'

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

  it("Allows users to search for a person and confirm that person's details", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prisoner = prisonerFactory.build({
      dateOfBirth: '1980-01-01',
      firstName: 'Del',
      lastName: 'Hatton',
    })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseOffering })
    cy.task('stubPrisoner', prisoner)

    const path = referPaths.new({ courseOfferingId: courseOffering.id })
    cy.visit(path)

    const findPersonPage = Page.verifyOnPage(FindPersonPage)
    findPersonPage.shouldContainNavigation(path)
    findPersonPage.shouldContainBackLink(referPaths.start({ courseOfferingId: courseOffering.id }))
    findPersonPage.shouldContainInstructionsParagraph()
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

  it("On confirming a person's details, creates a referral and redirects to the task list", () => {
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

    const referral = referralFactory.build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

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
      username: auth.mockedUsername,
    })

    checkAnswersPage.shouldHavePersonDetails(person)
    checkAnswersPage.shouldContainNavigation(path)
    checkAnswersPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    checkAnswersPage.shouldHaveApplicationSummary()
    checkAnswersPage.shouldHavePersonalDetailsSummary()
    checkAnswersPage.shouldHaveConfirmationCheckbox()
    checkAnswersPage.shouldContainButton('Submit referral')
    checkAnswersPage.shouldContainButtonLink('Return to tasklist', referPaths.show({ referralId: referral.id }))
  })
})
