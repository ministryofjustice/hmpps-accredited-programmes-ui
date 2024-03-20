import Page from '../../page'

export default class WithdrawReasonInformationPage extends Page {
  constructor() {
    super('Move referral to withdrawn')
  }

  enterWithdrawalReasonInformationAndSubmit(value: string) {
    cy.get('textarea[id="reason"]').type(value)
    this.shouldContainButton('Submit').click()
  }
}
