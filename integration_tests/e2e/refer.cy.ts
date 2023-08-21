import { findPaths, referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
} from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import Page from '../pages/page'
import ConfirmPersonPage from '../pages/refer/confirmPerson'
import FindPersonPage from '../pages/refer/findPerson'
import StartReferralPage from '../pages/refer/startReferral'

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
})
