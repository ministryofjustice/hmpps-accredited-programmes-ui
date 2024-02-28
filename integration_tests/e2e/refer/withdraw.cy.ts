import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  referralFactory,
  referralStatusCategoryFactory,
  referralStatusHistoryFactory,
  referralStatusReasonFactory,
  userFactory,
} from '../../../server/testutils/factories'
import auth from '../../mockApis/auth'
import Page from '../../pages/page'
import { WithdrawCategoryPage, WithdrawReasonInformationPage, WithdrawReasonPage } from '../../pages/shared'
import type { ReferralStatusHistoryPresenter } from '@accredited-programmes/ui'

context('Withdraw referral', () => {
  const anotherUser = userFactory.build({ name: 'Joshua Smith' })
  const referral = referralFactory.submitted().build({ referrerUsername: auth.mockedUser.username })

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
  })

  describe('withdrawal category', () => {
    const path = referPaths.withdraw.category({ referralId: referral.id })

    it('shows the withdrawal category page', () => {
      cy.visit(path)

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
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
            message: 'Select a withdrawal category',
          },
        ])
      })
    })
  })

  describe('withdrawal reason', () => {
    beforeEach(() => {
      cy.visit(referPaths.withdraw.category({ referralId: referral.id }))

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.selectWithdrawalCategoryAndSubmit(selectedCategory, referralStatusReasons)
    })

    it('shows the withdrawal reason page', () => {
      const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
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
            message: 'Select a withdrawal reason',
          },
        ])
      })
    })
  })

  describe('withdrawal reason information', () => {
    beforeEach(() => {
      cy.visit(referPaths.withdraw.category({ referralId: referral.id }))

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.selectWithdrawalCategoryAndSubmit(selectedCategory, [])
    })

    it('shows the withdrawal reason information page', () => {
      const withdrawReasonInformationPage = Page.verifyOnPage(WithdrawReasonInformationPage)
      withdrawReasonInformationPage.shouldContainCurrentStatusTimelineItem(presentedStatusHistory)
    })

    describe('when submitting without entering reason information', () => {
      it('displays an error', () => {
        const withdrawReasonInformationPage = Page.verifyOnPage(WithdrawReasonInformationPage)
        withdrawReasonInformationPage.shouldContainButton('Submit').click()
        withdrawReasonInformationPage.shouldHaveErrors([
          {
            field: 'reasonInformation',
            message: 'Enter withdrawal reason information',
          },
        ])
      })
    })
  })

  describe('when completing all the steps', () => {
    it('navigates through each step and redirects to the status history page', () => {
      cy.task('stubUpdateReferralStatus', referral.id)

      cy.visit(referPaths.withdraw.category({ referralId: referral.id }))

      const withdrawCategoryPage = Page.verifyOnPage(WithdrawCategoryPage)
      withdrawCategoryPage.selectWithdrawalCategoryAndSubmit(selectedCategory, referralStatusReasons)

      const withdrawReasonPage = Page.verifyOnPage(WithdrawReasonPage)
      withdrawReasonPage.selectWithdrawalReasonAndSubmit(selectedReason)

      const withdrawReasonInformationPage = Page.verifyOnPage(WithdrawReasonInformationPage)
      withdrawReasonInformationPage.enterWithdrawalReasonInformationAndSubmit(reasonInformation)

      cy.location('pathname').should('equal', referPaths.show.statusHistory({ referralId: referral.id }))
    })
  })
})
