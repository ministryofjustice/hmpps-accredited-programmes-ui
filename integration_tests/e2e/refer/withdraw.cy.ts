import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  confirmationFieldsFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  referralStatusCategoryFactory,
  referralStatusHistoryFactory,
  referralStatusReasonFactory,
  userFactory,
} from '../../../server/testutils/factories'
import auth from '../../mockApis/auth'
import Page from '../../pages/page'
import { WithdrawCategoryPage, WithdrawConfirmSelectionPage, WithdrawReasonPage } from '../../pages/shared'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

context('Withdraw referral', () => {
  const anotherUser = userFactory.build({ name: 'Joshua Smith' })
  const prison = prisonFactory.build()
  const prisoner = prisonerFactory.build({
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

  const referralStatusCategories = referralStatusCategoryFactory.buildList(4, { referralStatusCode: 'WITHDRAWN' })
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

  const selectedCategory = referralStatusCategories[0].code
  const selectedReason = referralStatusReasons[0].code
  const reasonInformation = 'Some reason information'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubUserDetails', anotherUser)
    cy.task('stubStatusHistory', {
      referralId: referral.id,
      statusHistory: referralStatusHistory,
    })
    cy.task('stubReferalStatusCodeCategories', {
      categories: referralStatusCategories,
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
  })

  describe('withdrawal category', () => {
    const path = referPaths.withdraw({ referralId: referral.id })

    it('shows the withdrawal category page', () => {
      cy.visit(path)

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.shouldHavePersonDetails(person)
      withdrawCategoryPage.shouldContainBackLink(referPaths.show.statusHistory({ referralId: referral.id }))
      withdrawCategoryPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
      withdrawCategoryPage.shouldContainWithdrawalCategoryRadioItems(referralStatusCategories)
    })

    describe('when submitting without selecting a category', () => {
      it('displays an error', () => {
        cy.visit(path)

        const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
        withdrawCategoryPage.shouldContainButton('Continue').click()
        withdrawCategoryPage.shouldHaveErrors([
          {
            field: 'categoryCode',
            message: 'Select a category',
          },
        ])
      })
    })
  })

  describe('withdrawal reason', () => {
    beforeEach(() => {
      cy.visit(referPaths.withdraw({ referralId: referral.id }))

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.selectWithdrawalCategoryAndSubmit(selectedCategory, referralStatusReasons)
    })

    it('shows the withdrawal reason page', () => {
      const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
      withdrawReasonPage.shouldHavePersonDetails(person)
      withdrawReasonPage.shouldContainBackLink(referPaths.show.statusHistory({ referralId: referral.id }))
      withdrawReasonPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
      withdrawReasonPage.shouldContainWithdrawalReasonRadioItems(referralStatusReasons)
    })

    describe('when submitting without selecting a reason', () => {
      it('displays an error', () => {
        const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
        withdrawReasonPage.shouldContainButton('Continue').click()
        withdrawReasonPage.shouldHaveErrors([
          {
            field: 'reasonCode',
            message: 'Select a reason',
          },
        ])
      })
    })
  })

  describe('withdrawal confirm selection', () => {
    beforeEach(() => {
      cy.visit(referPaths.withdraw({ referralId: referral.id }))

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.selectWithdrawalCategoryAndSubmit(selectedCategory, [])
    })

    it('shows the withdrawal confirm selection page', () => {
      const withdrawConfirmSelectionPage = Page.verifyOnPage(WithdrawConfirmSelectionPage)
      withdrawConfirmSelectionPage.shouldHavePersonDetails(person)
      withdrawConfirmSelectionPage.shouldContainBackLink(referPaths.show.statusHistory({ referralId: referral.id }))
      withdrawConfirmSelectionPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
    })

    describe('when submitting without entering a reason', () => {
      it('displays an error', () => {
        const withdrawConfirmSelectionPage = Page.verifyOnPage(WithdrawConfirmSelectionPage)
        withdrawConfirmSelectionPage.shouldContainButton('Submit').click()
        withdrawConfirmSelectionPage.shouldHaveErrors([
          {
            field: 'reason',
            message: 'Enter a reason',
          },
        ])
      })
    })
  })

  describe('when completing all the steps', () => {
    it('navigates through each step and redirects to the status history page', () => {
      cy.task('stubUpdateReferralStatus', referral.id)

      cy.visit(referPaths.withdraw({ referralId: referral.id }))

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.selectWithdrawalCategoryAndSubmit(selectedCategory, referralStatusReasons)

      const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
      withdrawReasonPage.selectWithdrawalReasonAndSubmit(selectedReason)

      const withdrawConfirmSelectionPage = Page.verifyOnPage(WithdrawConfirmSelectionPage)
      withdrawConfirmSelectionPage.enterWithdrawalReasonInformationAndSubmit(reasonInformation)

      cy.location('pathname').should('equal', referPaths.show.statusHistory({ referralId: referral.id }))
    })
  })
})
