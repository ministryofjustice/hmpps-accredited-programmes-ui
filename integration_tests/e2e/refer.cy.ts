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
import Page from '../pages/page'
import { ConfirmPersonPage, FindPersonPage, StartReferralPage, TaskListPage } from '../pages/refer'

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
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
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

  it("Shows the 'find person' page for a referral", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })

    const path = referPaths.new({ courseOfferingId: courseOffering.id })
    cy.visit(path)

    const findPersonPage = Page.verifyOnPage(FindPersonPage)
    findPersonPage.shouldContainNavigation(path)
    findPersonPage.shouldContainBackLink(referPaths.start({ courseOfferingId: courseOffering.id }))
    findPersonPage.shouldContainInstructionsParagraph()
    findPersonPage.shouldContainIdentifierForm()
  })

  it("Shows the 'confirm person' page when starting a new referral", () => {
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

    cy.task('stubPrisoner', prisoner)

    const path = referPaths.people.show({
      courseOfferingId: courseOffering.id,
      prisonNumber: person.prisonNumber,
    })
    cy.visit(path)
    const confirmPersonPage = Page.verifyOnPage(ConfirmPersonPage, { course, courseOffering, person })

    confirmPersonPage.shouldContainNavigation(path)
    confirmPersonPage.shouldContainBackLink(referPaths.new({ courseOfferingId: courseOffering.id }))
    confirmPersonPage.shouldContainContinueButton()
    confirmPersonPage.shouldContainDifferentIdentifierLink()
    confirmPersonPage.shouldHavePersonInformation()
  })

  it('Shows the in-progress referral task list', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison('an-ID', prison)
    const referral = referralFactory.build()

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.show({ courseOfferingId: courseOffering.id, referralId: referral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(TaskListPage, { course, courseOffering, organisation })
    taskListPage.shouldContainNavigation(path)
    taskListPage.shouldContainBackLink('#')
    taskListPage.shouldContainOrganisationAndCourseHeading(taskListPage)
    taskListPage.shouldContainAudienceTags(taskListPage.course.audienceTags)
  })
})
