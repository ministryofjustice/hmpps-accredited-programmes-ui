import { CourseUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithKeyAndValue } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class HspReferralDetailsPage extends Page {
  person: Person

  constructor(args: { course: Course; person: Person }) {
    const { course, person } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`, {
      hideTitleServiceName: true,
      pageTitleOverride: `Referral details for referral to ${coursePresenter.displayName}`,
    })

    this.person = person
  }

  shouldContainMinorsSummaryList(listRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>): void {
    cy.get('[data-testid="offence-against-minors-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(listRows, summaryListElement)
    })
  }

  shouldContainOtherSummarySummaryList(listRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>): void {
    cy.get('[data-testid="offence-other-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(listRows, summaryListElement)
    })
  }

  shouldContainViolenceForceSummaryList(listRows: Array<GovukFrontendSummaryListRowWithKeyAndValue>): void {
    cy.get('[data-testid="offence-violence-force-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(listRows, summaryListElement)
    })
  }
}
