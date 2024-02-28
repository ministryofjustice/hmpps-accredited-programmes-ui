import { ReferralUtils } from '../../../../server/utils'
import Page from '../../page'
import type { ReferralStatusReason } from '@accredited-programmes/models'

export default class WithdrawReasonPage extends Page {
  constructor() {
    super('Withdrawal reason')
  }

  selectWithdrawalReasonAndSubmit(value: ReferralStatusReason['code']) {
    this.selectRadioButton('reasonCode', value)
    this.shouldContainButton('Continue').click()
  }

  shouldContainWithdrawalReasonRadioItems(referralStatusReasons: Array<ReferralStatusReason>) {
    cy.get('[data-testid="withdraw-reason-options"]').within(() => {
      this.shouldContainRadioItems(ReferralUtils.statusOptionsToRadioItems(referralStatusReasons))
    })
  }
}
