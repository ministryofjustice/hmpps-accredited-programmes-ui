import Page from '../page'
import type { Course, Referral } from '@accredited-programmes-api'

export default class TransferPage extends Page {
  originalCourse: Course

  referral: Referral

  targetCourse: Course

  constructor(args: { originalCourse: Course; referral: Referral; targetCourse: Course }) {
    const { originalCourse, referral, targetCourse } = args

    super(`Move referral to ${targetCourse.name}`, {})

    this.originalCourse = originalCourse
    this.referral = referral
    this.targetCourse = targetCourse
  }

  shouldContainTransferDescriptionReasonText() {
    cy.get('[data-testid="transfer-description-reason-text"]').should(
      'contain.text',
      `You must give a reason for transferring this referral to ${this.targetCourse.name}.`,
    )
  }

  shouldContainTransferDescriptionText() {
    cy.get('[data-testid="transfer-description-text"]').should(
      'contain.text',
      `This will transfer the referral from ${this.originalCourse.name} to ${this.targetCourse.name}.`,
    )
  }

  shouldEnterAndSubmitTransferReason(transferReason: string) {
    cy.get('textarea[id="transferReason"]').type(transferReason)
    this.shouldContainButton('Submit').click()
  }
}
