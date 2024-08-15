import { CourseUtils, RelationshipsUtils, ShowRisksAndNeedsUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course } from '@accredited-programmes/models'
import type { Relationships } from '@accredited-programmes-api'

export default class RelationshipsPage extends Page {
  relationships: Relationships

  constructor(args: { course: Course; relationships: Relationships }) {
    const { course, relationships } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.relationships = relationships
  }

  shouldContainCloseRelationshipsSummaryList() {
    cy.get('[data-testid="close-relationships-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        RelationshipsUtils.closeRelationshipsSummaryListRows(this.relationships),
        summaryListElement,
      )
    })
  }

  shouldContainDomesticViolenceSummaryList() {
    cy.get('[data-testid="domestic-violence-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        RelationshipsUtils.domesticViolenceSummaryListRows(this.relationships),
        summaryListElement,
      )
    })
  }

  shouldContainFamilyRelationshipsSummaryList() {
    cy.get('[data-testid="family-relationships-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        RelationshipsUtils.familyRelationshipsSummaryListRows(this.relationships),
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

  shouldContainRelationshipToChildrenSummaryList() {
    cy.get('[data-testid="relationship-to-children-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(
        RelationshipsUtils.relationshipToChildrenSummaryListRows(this.relationships),
        summaryListElement,
      )
    })
  }
}
