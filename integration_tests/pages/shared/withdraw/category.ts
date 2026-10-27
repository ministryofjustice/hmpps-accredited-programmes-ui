import { ReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { ReferralStatusCategory } from '@accredited-programmes/models'
import type { ReferralStatusReason } from '@accredited-programmes-api'

export default class WithdrawCategoryPage extends Page {
  constructor() {
    super('Withdraw referral', {
      pageTitleOverride: '',
    })
  }

  selectWithdrawalCategoryAndSubmit(value: ReferralStatusCategory['code'], reasons: Array<ReferralStatusReason>) {
    cy.task('stubReferralStatusCodeReasons', {
      reasons,
      referralStatus: 'WITHDRAWN',
      referralStatusCategoryCode: value,
    })
    this.selectRadioButton('categoryCode', value)
    this.shouldContainButton('Continue').click()
  }

  shouldContainWithdrawalCategoryRadioItems(referralStatusCategories: Array<ReferralStatusCategory>) {
    cy.get('[data-testid="category-options"]').within(() => {
      this.shouldContainRadioItems(ReferralUtils.statusOptionsToRadioItems(referralStatusCategories))
    })
  }
}
