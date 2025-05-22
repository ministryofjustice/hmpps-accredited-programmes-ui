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
import TransferErrorPage from '../../pages/assess/transferError'
import Page from '../../pages/page'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Organisation } from '@accredited-programmes-api'

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
  const organisation: Organisation = { code: originalCourseOffering.organisationId, prisonName: 'HMP Test' }

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

  // The referral that we'll attempt to transfer
  const referral = referralFactory.submitted().build({
    offeringId: originalCourseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: auth.mockedUser.username,
  })

  const transferPath = assessPaths.transfer.show({ referralId: referral.id })

  const referralDetailsPath = assessPaths.show.personalDetails({ referralId: referral.id })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.signIn()

    cy.task('stubCourseByOffering', { course: originalCourse, courseOfferingId: originalCourseOffering.id })
    cy.task('stubUserDetails', anotherUser)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubPni', { pniScore, prisonNumber: person.prisonNumber })

    cy.task('stubReferral', referral)
  })

  describe('when the referral can be transferred', () => {
    beforeEach(() => {
      cy.task('stubStatusHistory', {
        referralId: referral.id,
        statusHistory: referralStatusHistory,
      })
      cy.task('stubBuildingChoicesCourseByReferral', {
        course: buildingChoicesModerateCourse,
        programmePathway: pniScore.programmePathway,
        referralId: referral.id,
      })
      cy.task('stubFindDuplicates', {
        offeringId: buildingChoicesModerateOffering.id,
        prisonNumber: person.prisonNumber,
        referrals: [],
      })
    })

    it('should allow a transfer reason to be submitted and redirect to the newly created referral', () => {
      const newReferral = referralFactory.submitted().build()
      const transferReason = 'Because I want to.'

      cy.task('stubTransferReferral', {
        newReferral,
        requestBody: {
          offeringId: buildingChoicesModerateOffering.id,
          referralId: referral.id,
          transferReason,
        },
      })

      cy.visit(transferPath)

      const transferPage = Page.verifyOnPage(TransferPage, {
        originalCourse,
        referral,
        targetCourse: buildingChoicesModerateCourse,
      })
      transferPage.shouldHavePersonDetails(person)
      transferPage.shouldContainBackLink(referralDetailsPath)
      transferPage.shouldContainTransferDescriptionText()
      transferPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
      transferPage.shouldContainTransferDescriptionReasonText()
      transferPage.shouldContainWarningText(
        `The ${originalCourse.name} referral will close. A new referral to ${buildingChoicesModerateCourse.name} will be created.`,
      )
      transferPage.shouldContainLink('Cancel', referralDetailsPath)
      transferPage.shouldEnterAndSubmitTransferReason(transferReason)

      cy.location('pathname').should('equal', assessPaths.show.statusHistory({ referralId: newReferral.id }))
    })

    describe('but try to submit the form without entering a transfer reason', () => {
      it('should show an error message', () => {
        cy.visit(transferPath)

        const transferPage = Page.verifyOnPage(TransferPage, {
          originalCourse,
          referral,
          targetCourse: buildingChoicesModerateCourse,
        })
        transferPage.shouldContainButton('Submit').click()
        transferPage.shouldHaveErrors([
          {
            field: 'transferReason',
            message: 'Enter a reason for transferring this referral',
          },
        ])
      })
    })
  })

  describe('when the referral cannot be transferred', () => {
    describe('because there is no PNI score', () => {
      it('should show the missing information error content', () => {
        cy.task('stubPni', { pniScore: null, prisonNumber: person.prisonNumber })

        cy.visit(transferPath)

        const transferErrorPage = Page.verifyOnPage(TransferErrorPage, {
          organisation,
          originalCourse,
          person,
          referral,
        })
        transferErrorPage.shouldHavePersonDetails(person)
        transferErrorPage.shouldContainBackLink(referralDetailsPath)
        transferErrorPage.shouldContainMissingInformationErrorText()
        transferErrorPage.shouldContainReturnToReferralButton()
      })
    })

    describe('because the PNI programmePathway is `MISSING_INFORMATION', () => {
      const missingInformationPniScore = pniScoreFactory.build({
        prisonNumber: person.prisonNumber,
        programmePathway: 'MISSING_INFORMATION',
      })

      it('should show an error the missing information error content', () => {
        cy.task('stubPni', { pniScore: missingInformationPniScore, prisonNumber: person.prisonNumber })

        cy.visit(transferPath)

        const transferErrorPage = Page.verifyOnPage(TransferErrorPage, {
          organisation,
          originalCourse,
          person,
          referral,
        })
        transferErrorPage.shouldHavePersonDetails(person)
        transferErrorPage.shouldContainBackLink(referralDetailsPath)
        transferErrorPage.shouldContainMissingInformationErrorText()
        transferErrorPage.shouldContainReturnToReferralButton()
      })
    })

    describe('because the PNI programmePathway is `ALTERNATIVE_PATHWAY', () => {
      const alternativePathwayPniScore = pniScoreFactory.build({
        prisonNumber: person.prisonNumber,
        programmePathway: 'ALTERNATIVE_PATHWAY',
      })

      it('should show the not eligible error content', () => {
        cy.task('stubPni', { pniScore: alternativePathwayPniScore, prisonNumber: person.prisonNumber })

        cy.visit(transferPath)

        const transferErrorPage = Page.verifyOnPage(TransferErrorPage, {
          organisation,
          originalCourse,
          person,
          referral,
        })
        transferErrorPage.shouldHavePersonDetails(person)
        transferErrorPage.shouldContainBackLink(referralDetailsPath)
        transferErrorPage.shouldContainNotEligibleErrorText()
        transferErrorPage.shouldContainReturnToReferralButton()
      })
    })

    describe('because there is no suitable Building Choices course at the location of the original referral', () => {
      it('should show the no Building Choices not offered content', () => {
        cy.task('stubBuildingChoicesCourseByReferral', {
          programmePathway: pniScore.programmePathway,
          referralId: referral.id,
        })
        cy.task('stubOffering', { courseOffering: originalCourseOffering })
        cy.task('stubOrganisation', organisation)

        cy.visit(transferPath)

        const transferErrorPage = Page.verifyOnPage(TransferErrorPage, {
          organisation,
          originalCourse,
          person,
          referral,
        })
        transferErrorPage.shouldHavePersonDetails(person)
        transferErrorPage.shouldContainBackLink(referralDetailsPath)
        transferErrorPage.shouldContainNoCourseText()
        transferErrorPage.shouldContainReturnToReferralButton()
      })
    })
  })
})
