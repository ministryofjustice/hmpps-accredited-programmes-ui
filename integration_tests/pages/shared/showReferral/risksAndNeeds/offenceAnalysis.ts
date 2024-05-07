import { CourseUtils, OffenceAnalysisUtils, ShowRisksAndNeedsUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, OffenceDetail } from '@accredited-programmes/models'

export default class OffenceAnalysisPage extends Page {
  offenceDetail: OffenceDetail

  constructor(args: { course: Course; offenceDetail: OffenceDetail }) {
    const { course, offenceDetail } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.offenceDetail = offenceDetail
  }

  shouldContainBriefOffenceDetailsSummaryCard() {
    cy.get('[data-testid="brief-offence-details-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 2.1 - Brief offence details',
        ShowRisksAndNeedsUtils.textValue(this.offenceDetail.offenceDetails),
        summaryCardElement,
      )
    })
  }

  shouldContainImpactAndConsequencesSummaryList() {
    cy.get('[data-testid="impact-and-consequences-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        OffenceAnalysisUtils.impactAndConsequencesSummaryListRows(this.offenceDetail),
        summaryListElement,
      )
    })
  }

  shouldContainMotivationAndTriggersSummaryCard() {
    cy.get('[data-testid="motivation-and-triggers-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 2.8 - Motivation and triggers',
        ShowRisksAndNeedsUtils.textValue(this.offenceDetail.motivationAndTriggers),
        summaryCardElement,
      )
    })
  }

  shouldContainNoOffenceDetailsSummaryCard() {
    cy.get('[data-testid="no-offence-details-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 2 - Offence analysis',
        'No offence details found in OASys. Add offence details to OASys to see them here.',
        summaryCardElement,
      )
    })
  }

  shouldContainOtherOffendersAndInfluencesSummaryList() {
    cy.get('[data-testid="other-offenders-and-influences-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        OffenceAnalysisUtils.otherOffendersAndInfluencesSummaryListRows(this.offenceDetail),
        summaryListElement,
      )
    })
  }

  shouldContainPatternOffendingSummaryCard() {
    cy.get('[data-testid="pattern-offending-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 2.12 - Pattern of offending',
        ShowRisksAndNeedsUtils.textValue(this.offenceDetail.patternOffending),
        summaryCardElement,
      )
    })
  }

  shouldContainResponsibilitySummaryList() {
    cy.get('[data-testid="responsibility-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        OffenceAnalysisUtils.responsibilitySummaryListRows(this.offenceDetail),
        summaryListElement,
      )
    })
  }

  shouldContainVictimsAndPartnersSummaryList() {
    cy.get('[data-testid="victims-and-partners-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        OffenceAnalysisUtils.victimsAndPartnersSummaryListRows(this.offenceDetail),
        summaryListElement,
      )
    })
  }
}
