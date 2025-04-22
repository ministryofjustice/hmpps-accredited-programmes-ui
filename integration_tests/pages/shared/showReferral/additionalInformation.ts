import { CourseUtils, DateUtils, ShowReferralUtils } from '../../../../server/utils'
import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { Course, PniScore, Referral } from '@accredited-programmes-api'

export default class AdditionalInformationPage extends Page {
  course: Course

  referral: Referral

  constructor(args: { course: Course; referral: Referral }) {
    const { course, referral } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`, {
      hideTitleServiceName: true,
      pageTitleOverride: `Referral details for referral to ${coursePresenter.displayName}`,
    })

    this.course = course
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

  shouldContainPniOverrideSummaryCard(recommendedPathway: PniScore['programmePathway']) {
    cy.get('[data-testid="pni-override-summary-card"]').within(() => {
      cy.get('[data-testid="pni-override-summary-card-title"]').should(
        'contain.text',
        'Reason why the referral does not match the PNI',
      )

      this.shouldContainText(
        'This referral does not match the recommendation based on the risk and programme needs identifier (PNI) scores.',
      )

      cy.get('[data-testid="pni-override-summary-list"]').then(summaryListElement => {
        this.shouldContainSummaryListRows(
          ShowReferralUtils.pniMismatchSummaryListRows(
            recommendedPathway,
            this.course.intensity,
            this.referral.referrerOverrideReason,
          ),
          summaryListElement,
        )
      })
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

  shouldContainTreatmentManagerDecision() {
    cy.get('[data-testid="treatment-manager-decision-text"]').should(
      'contain.text',
      `The person has been assessed as ${this.referral.statusDescription!.toLowerCase()} by the Treatment Manager.`,
    )
  }

  shouldNotContainPniOverrideSummaryCard() {
    cy.get('[data-testid="pni-override-summary-card"]').should('not.exist')
  }

  shouldNotContainTreatmentManagerDecision() {
    cy.get('[data-testid="treatment-manager-decision-text"]').should('not.exist')
  }
}
