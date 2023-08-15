import { findPaths, referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
} from '../../server/testutils/factories'
import { organisationUtils } from '../../server/utils'
import Page from '../pages/page'
import ConfirmPersonPage from '../pages/refer/confirmPerson'
import ReferralStartPage from '../pages/refer/referralStart'

context('Refer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Shows the start page for a referral', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({
      secondaryContactEmail: null,
    })
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = organisationUtils.organisationFromPrison('an-ID', prison)

    cy.task('stubCourse', course)
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.start({ courseId: course.id, courseOfferingId: courseOffering.id })
    cy.visit(path)

    const referralStartPage = Page.verifyOnPage(ReferralStartPage, { course, organisation })
    referralStartPage.shouldContainNavigation(path)
    referralStartPage.shouldContainBackLink(
      findPaths.offerings.show({ courseId: course.id, courseOfferingId: courseOffering.id }),
    )
    referralStartPage.shouldContainOrganisationAndCourseHeading(referralStartPage)
    referralStartPage.shouldContainAudienceTags(referralStartPage.course.audienceTags)
    referralStartPage.shouldHaveProcessInformation()
    referralStartPage.shouldContainStartButtonLink()
  })

  it('Shows the "confirm person" page when starting a new referral', () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
      dateOfBirth: '1980-01-01',
    })

    const person = personFactory.build({
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
      currentPrison: prisoner.prisonName,
      dateOfBirth: '1 January 1980',
      ethnicity: prisoner.ethnicity,
      gender: prisoner.gender,
      religionOrBelief: prisoner.religion,
      setting: 'Custody',
    })

    cy.task('stubPrisoner', prisoner)

    const path = referPaths.people.show({
      courseId: course.id,
      courseOfferingId: courseOffering.id,
      prisonNumber: person.prisonNumber,
    })
    cy.visit(path)
    const confirmPersonPage = Page.verifyOnPage(ConfirmPersonPage, person)

    confirmPersonPage.shouldContainNavigation(path)
    confirmPersonPage.shouldContainBackLink('#')
    confirmPersonPage.shouldContainContinueButton()
    confirmPersonPage.shouldContainDifferentIdentifierLink()
    confirmPersonPage.shouldHavePersonInformation()
  })
})
