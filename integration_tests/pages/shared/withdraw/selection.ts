import Page from '../../page'

export default class WithdrawConfirmSelectionPage extends Page {
  constructor() {
    super('Withdraw referral')
  }

  enterWithdrawalReasonInformationAndSubmit(value: string) {
    cy.get('textarea[id="reason"]').type(value)
    this.shouldContainButton('Submit').click()
  }
}
