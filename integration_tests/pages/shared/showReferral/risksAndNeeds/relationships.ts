import { CourseUtils, RelationshipsUtils, ShowRisksAndNeedsUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, Relationships } from '@accredited-programmes/models'

export default class RelationshipsPage extends Page {
  relationships: Relationships

  constructor(args: { course: Course; relationships: Relationships }) {
    const { course, relationships } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.relationships = relationships
  }

  shouldContainDomesticViolenceSummaryList() {
    cy.get('[data-testid="domestic-violence-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        RelationshipsUtils.domesticViolenceSummaryListRows(this.relationships),
        summaryListElement,
      )
    })
  }

  shouldContainNoRelationshipsSummaryCard() {
    cy.get('[data-testid="no-relationships-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Section 6 - Relationships',
        'No relationships found in OASys. Add relationships to OASys to see it here.',
        summaryCardElement,
      )
    })
  }

  shouldContainRelationshipIssuesSummaryCard() {
    cy.get('[data-testid="relationship-issues-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Relationship issues affecting risk of offending or harm',
        ShowRisksAndNeedsUtils.textValue(this.relationships.relIssuesDetails),
        summaryCardElement,
      )
    })
  }
}
