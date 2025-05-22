import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  confirmationFieldsFactory,
  peopleSearchResponseFactory,
  personFactory,
  referralFactory,
  referralStatusHistoryFactory,
  referralStatusReasonFactory,
  referralStatusRefDataFactory,
  userFactory,
} from '../../../server/testutils/factories'
import auth from '../../mockApis/auth'
import Page from '../../pages/page'
import { WithdrawConfirmSelectionPage, WithdrawReasonPage } from '../../pages/shared'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'
import type { Organisation } from '@accredited-programmes-api'

context('Withdraw referral', () => {
  const anotherUser = userFactory.build({ name: 'Joshua Smith' })
  const organisation: Organisation = { code: 'WTI', prisonName: 'Whatton' }
  const prisoner = peopleSearchResponseFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    conditionalReleaseDate: '2024-10-31',
    currentPrison: prisoner.prisonName,
    dateOfBirth: '1 January 1980',
    ethnicity: prisoner.ethnicity,
    gender: prisoner.gender,
    homeDetentionCurfewEligibilityDate: prisoner.homeDetentionCurfewEligibilityDate,
    indeterminateSentence: false,
    name: 'Del Hatton',
    paroleEligibilityDate: prisoner.paroleEligibilityDate,
    prisonNumber: prisoner.prisonerNumber,
    religionOrBelief: prisoner.religion,
    sentenceExpiryDate: prisoner.sentenceExpiryDate,
    sentenceStartDate: prisoner.sentenceStartDate,
    setting: 'Custody',
    tariffDate: prisoner.tariffDate,
  })
  const referral = referralFactory
    .submitted()
    .build({ prisonNumber: prisoner.prisonerNumber, referrerUsername: auth.mockedUser.username })

  const referralStatusReasons = referralStatusReasonFactory.buildList(5)

  const referralStatusHistory = [
    referralStatusHistoryFactory.updated().build({ status: 'assessment_started', username: anotherUser.username }),
    referralStatusHistoryFactory.submitted().build({ username: referral.referrerUsername }),
  ]
  const presentedStatusHistory: Array<ReferralStatusHistoryPresenter> = [
    {
      ...referralStatusHistory[0],
      byLineText: anotherUser.name,
    },
    {
      ...referralStatusHistory[1],
      byLineText: 'You',
    },
  ]

  const selectedReason = referralStatusReasons[0].code
  const reasonInformation = 'Some reason information'
  const referralStatusCodeData = referralStatusRefDataFactory.build({
    code: 'WITHDRAWN',
    hasConfirmation: false,
    hasNotes: true,
    notesOptional: false,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubOrganisation', organisation)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubUserDetails', anotherUser)
    cy.task('stubStatusHistory', {
      referralId: referral.id,
      statusHistory: referralStatusHistory,
    })
    cy.task('stubReferralStatusCodeReasonsWithCategory', {
      reasons: referralStatusReasons,
      referralStatus: 'WITHDRAWN',
    })
    cy.task('stubConfirmationText', {
      chosenStatusCode: 'WITHDRAWN',
      confirmationText: confirmationFieldsFactory.build({
        hasConfirmation: false,
        primaryDescription: 'If you withdraw the referral, it will be closed.',
        primaryHeading: 'Withdraw referral',
        secondaryDescription: 'Provide more information about the reason for withdrawing this referral.',
        secondaryHeading: 'Give a reason',
        warningText: 'Submitting this will close the referral.',
      }),
      referralId: referral.id,
    })
    cy.task('stubReferralStatusCodeData', referralStatusCodeData)
  })

  describe('withdrawal reason', () => {
    beforeEach(() => {
      cy.visit(referPaths.withdraw({ referralId: referral.id }))
    })

    it('shows the withdrawal reason page', () => {
      const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
      withdrawReasonPage.shouldHavePersonDetails(person)
      withdrawReasonPage.shouldContainBackLink(referPaths.show.statusHistory({ referralId: referral.id }))
      withdrawReasonPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
      withdrawReasonPage.shouldContainWithdrawalReasonRadioItems(referralStatusReasons)
      withdrawReasonPage.shouldContainLink('Cancel', referPaths.show.statusHistory({ referralId: referral.id }))
    })

    describe('when submitting without selecting a reason', () => {
      it('displays an error', () => {
        const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
        withdrawReasonPage.shouldContainButton('Continue').click()
        withdrawReasonPage.shouldHaveErrors([
          {
            field: 'reasonCode',
            message: 'Select a withdrawal reason',
          },
        ])
      })
    })
  })

  describe('when completing all the steps', () => {
    it('navigates through each step and redirects to the status history page', () => {
      cy.task('stubUpdateReferralStatus', referral.id)

      cy.visit(referPaths.withdraw({ referralId: referral.id }))

      const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
      withdrawReasonPage.selectWithdrawalReasonAndSubmit(selectedReason)

      const withdrawConfirmSelectionPage = Page.verifyOnPage(WithdrawConfirmSelectionPage)
      withdrawConfirmSelectionPage.enterWithdrawalReasonInformationAndSubmit(reasonInformation)

      cy.location('pathname').should('equal', referPaths.show.statusHistory({ referralId: referral.id }))
    })
  })
})
