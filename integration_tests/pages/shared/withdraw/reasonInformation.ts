import Page from '../../page'

export default class WithdrawReasonInformationPage extends Page {
  constructor() {
    super('Withdraw referral')
  }

  enterWithdrawalReasonInformationAndSubmit(value: string) {
    cy.get('textarea[id="reasonInformation"]').type(value)
    this.shouldContainButton('Submit').click()
  }
}
