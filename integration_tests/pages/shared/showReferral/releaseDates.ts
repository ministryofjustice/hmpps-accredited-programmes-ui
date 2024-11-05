import { CourseUtils, PersonUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Person, SentenceDetails } from '@accredited-programmes/models'
import type { Course } from '@accredited-programmes-api'

export default class SentenceInformationPage extends Page {
  person: Person

  sentenceDetails: SentenceDetails

  constructor(args: { course: Course; person: Person; sentenceDetails: SentenceDetails }) {
    const { course, person, sentenceDetails } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.person = person
    this.sentenceDetails = sentenceDetails
  }

  shouldContainNoReleaseDatesSummaryCard(): void {
    cy.get('[data-testid="no-release-dates-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Release dates',
        'There are no release dates for this person.',
        summaryCardElement,
      )
    })
  }

  shouldContainReleaseDatesSummaryCard(): void {
    cy.get('[data-testid="release-dates-summary-card"]').then(summaryCardElement => {
      this.shouldContainSummaryCard(
        'Release dates',
        [],
        PersonUtils.releaseDatesSummaryListRows(this.sentenceDetails.keyDates),
        summaryCardElement,
      )
    })
  }
}
