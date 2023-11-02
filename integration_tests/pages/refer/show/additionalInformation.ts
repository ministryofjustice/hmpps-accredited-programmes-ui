import { CourseUtils, DateUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Referral } from '@accredited-programmes/models'

export default class AdditionalInformationPage extends Page {
  referral: Referral

  constructor(args: { course: Course; referral: Referral }) {
    const { course, referral } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.referral = referral
  }

  shouldContainAdditionalInformation() {
    cy.get('[data-testid="additional-information"]').should('have.text', this.referral.additionalInformation)
  }

  shouldContainSubmittedText() {
    cy.get('[data-testid="submitted-text"]').should(
      'contain.text',
      `Submitted in referral on ${DateUtils.govukFormattedFullDateString(this.referral.submittedOn)}.`,
    )
  }
}
