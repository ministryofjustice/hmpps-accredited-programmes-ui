import { CourseUtils, DateUtils } from '../../../../server/utils'
import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { Course, Referral } from '@accredited-programmes-api'

export default class AdditionalInformationPage extends Page {
  referral: Referral

  constructor(args: { course: Course; referral: Referral }) {
    const { course, referral } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`, {
      hideTitleServiceName: true,
      pageTitleOverride: `Referral details for referral to ${coursePresenter.displayName}`,
    })

    this.referral = referral
  }

  shouldContainAdditionalInformationSummaryCard() {
    cy.get('[data-testid="additional-information-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Additional information',
        this.referral.additionalInformation as string,
        summaryCardElement,
      )
    })
  }

  shouldContainSubmittedText() {
    cy.get('[data-testid="submitted-text"]').then(submittedTextElement => {
      const { actual, expected } = Helpers.parseHtml(
        submittedTextElement,
        `Submitted in referral on ${DateUtils.govukFormattedFullDateString(this.referral.submittedOn)}.`,
      )
      expect(actual).to.equal(expected)
    })
  }
}
