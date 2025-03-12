import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  peopleSearchResponseFactory,
  personFactory,
  pniScoreFactory,
  referralFactory,
  referralStatusHistoryFactory,
  userFactory,
} from '../../../server/testutils/factories'
import auth from '../../mockApis/auth'
import TransferPage from '../../pages/assess/transfer'
import Page from '../../pages/page'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

context('Transferring a referral to building choices', () => {
  // Person and their PNI score
  const prisoner = peopleSearchResponseFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    name: `${prisoner.firstName} ${prisoner.lastName}`,
    prisonNumber: prisoner.prisonerNumber,
  })
  const pniScore = pniScoreFactory.build({
    prisonNumber: person.prisonNumber,
    programmePathway: 'MODERATE_INTENSITY_BC',
  })

  // Original course and offering for referral
  const originalCourseOffering = courseOfferingFactory.build()
  const originalCourse = courseFactory.build({
    courseOfferings: [originalCourseOffering],
  })

  // Target moderate Building Choices course
  const buildingChoicesModerateOffering = courseOfferingFactory.build()
  const buildingChoicesModerateCourse = courseFactory.build({
    courseOfferings: [buildingChoicesModerateOffering],
    intensity: 'MODERATE',
    name: 'Building Choices: moderate intensity',
  })

  // The referring user and timeline history
  const anotherUser = userFactory.build({ name: 'Joshua Smith' })
  const referringUser = userFactory.build({ name: 'Referring User', username: auth.mockedUser.username })
  const referralStatusHistory = [
    referralStatusHistoryFactory.updated().build({ status: 'assessment_started', username: anotherUser.username }),
    referralStatusHistoryFactory.submitted().build({ username: referringUser.username }),
  ]
  const presentedStatusHistory: Array<ReferralStatusHistoryPresenter> = [
    { ...referralStatusHistory[0], byLineText: anotherUser.name },
    { ...referralStatusHistory[1], byLineText: 'You' },
  ]

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.signIn()

    cy.task('stubCourseByOffering', { course: originalCourse, courseOfferingId: originalCourseOffering.id })
    cy.task('stubUserDetails', anotherUser)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubPni', { pniScore, prisonNumber: person.prisonNumber })
  })

  describe('when the referral can be transferred', () => {
    const transferableReferral = referralFactory.submitted().build({
      offeringId: originalCourseOffering.id,
      prisonNumber: person.prisonNumber,
      referrerUsername: auth.mockedUser.username,
    })

    const path = assessPaths.transfer.show({ referralId: transferableReferral.id })

    it('should show the transfer referral form page', () => {
      const referralDetailsPage = assessPaths.show.personalDetails({ referralId: transferableReferral.id })

      cy.task('stubReferral', transferableReferral)
      cy.task('stubStatusHistory', {
        referralId: transferableReferral.id,
        statusHistory: referralStatusHistory,
      })
      cy.task('stubBuildingChoicesCourseByReferral', {
        course: buildingChoicesModerateCourse,
        programmePathway: pniScore.programmePathway,
        referralId: transferableReferral.id,
      })
      cy.task('stubFindDuplicates', {
        offeringId: buildingChoicesModerateOffering.id,
        prisonNumber: person.prisonNumber,
        referrals: [],
      })

      cy.visit(path)

      const transferPage = Page.verifyOnPage(TransferPage, {
        originalCourse,
        referral: transferableReferral,
        targetCourse: buildingChoicesModerateCourse,
      })
      transferPage.shouldHavePersonDetails(person)
      transferPage.shouldContainBackLink(referralDetailsPage)
      transferPage.shouldContainTransferDescriptionText()
      transferPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
      transferPage.shouldContainTransferDescriptionReasonText()
      transferPage.shouldContainWarningText(
        `The ${originalCourse.name} referral will close. A new referral to ${buildingChoicesModerateCourse.name} will be created.`,
      )
      transferPage.shouldContainButton('Submit')
      transferPage.shouldContainLink('Cancel', referralDetailsPage)
    })
  })
})
