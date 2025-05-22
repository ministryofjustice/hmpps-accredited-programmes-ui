import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  peopleSearchResponseFactory,
  personFactory,
  referralFactory,
} from '../../../../server/testutils/factories'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import { NewReferralDeletePage, NewReferralTaskListPage } from '../../../pages/refer'
import type { Organisation } from '@accredited-programmes-api'

context('Deleting a referral', () => {
  const courseOffering = courseOfferingFactory.build()
  const prisoner = peopleSearchResponseFactory.build({
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
  const referral = referralFactory.started().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: auth.mockedUser.username,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  it('Shows the delete page and the success message', () => {
    cy.task('stubOffering', { courseOffering })

    const course = courseFactory.build()
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })

    const organisation: Organisation = { code: courseOffering.organisationId, prisonName: 'HMP Test' }
    cy.task('stubOrganisation', organisation)

    const path = referPaths.new.show({ referralId: referral.id })
    cy.visit(path)

    const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, { course, courseOffering, organisation, referral })
    taskListPage
      .shouldContainButtonLink('Delete draft referral', referPaths.new.delete({ referralId: referral.id }))
      .click()

    const deletePage = Page.verifyOnPage(NewReferralDeletePage, { person, referral })
    deletePage.shouldHavePersonDetails(person)
    deletePage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
    deletePage.shouldContainButton('Delete draft')
    deletePage.shouldContainLink('Cancel', referPaths.new.show({ referralId: referral.id }))
    deletePage.shouldDeleteSuccessfully()
  })
})
