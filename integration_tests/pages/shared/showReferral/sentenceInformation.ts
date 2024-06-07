import { CourseUtils, SentenceInformationUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Person, SentenceDetails } from '@accredited-programmes/models'

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

  shouldContainNoSentenceDetailsSummaryCard(): void {
    cy.get('[data-testid="no-sentence-information-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Sentence details',
        'There are no sentence details for this person.',
        summaryCardElement,
      )
    })
  }

  shouldContainSentenceDetailsSummaryCards(): void {
    this.sentenceDetails.sentences?.forEach((sentence, index) => {
      cy.get(`[data-testid="sentence-details-summary-card-${index + 1}"]`).then(summaryCardElement => {
        this.shouldContainSummaryCard(
          `Sentence ${index + 1}`,
          [],
          SentenceInformationUtils.summaryLists(this.sentenceDetails)[index].rows,
          summaryCardElement,
        )
      })
    })
  }
}
