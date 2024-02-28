import { ReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { ReferralStatusCategory, ReferralStatusReason } from '@accredited-programmes/models'

export default class WithdrawCategoryPage extends Page {
  constructor() {
    super('Withdrawal category')
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
    cy.get('[data-testid="withdraw-category-options"]').within(() => {
      this.shouldContainRadioItems(ReferralUtils.statusOptionsToRadioItems(referralStatusCategories))
    })
  }
}
