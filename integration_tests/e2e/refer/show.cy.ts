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
import { ShowPersonPage, TaskListPage } from '../../pages/refer'

context('Showing the referral task list and person page', () => {
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

  it('Shows the in-progress referral task list', () => {
    cy.task('stubOffering', { courseOffering })

    const course = courseFactory.build()
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })

    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)
    cy.task('stubPrison', prison)

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
    const path = referPaths.showPerson({ referralId: referral.id })
    cy.visit(path)

    const showPersonPage = Page.verifyOnPage(ShowPersonPage, { person })
    showPersonPage.shouldHavePersonDetails(person)
    showPersonPage.shouldContainNavigation(path)
    showPersonPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
    showPersonPage.shouldContainPersonSummaryList(person)
  })
})
