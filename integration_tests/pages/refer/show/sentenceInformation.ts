import { CourseUtils, DateUtils, SentenceInformationUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course } from '@accredited-programmes/models'
import type { SentenceAndOffenceDetails } from '@prison-api'

export default class SentenceInformationPage extends Page {
  sentenceAndOffenceDetails: SentenceAndOffenceDetails

  constructor(args: { course: Course; sentenceAndOffenceDetails: SentenceAndOffenceDetails }) {
    const { course, sentenceAndOffenceDetails } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.sentenceAndOffenceDetails = sentenceAndOffenceDetails
  }

  shouldContainImportedFromText(): void {
    cy.get('[data-testid="imported-from-text"]').should(
      'contain.text',
      `Imported from OASys on ${DateUtils.govukFormattedFullDateString()}.`,
    )
  }

  shouldContainSentenceDetailsSummaryCard(): void {
    cy.get('[data-testid="sentence-details-summary-card"]').then(summaryCardElement => {
      this.shouldContainSummaryCard(
        'Sentence details',
        [],
        SentenceInformationUtils.detailsSummaryListRows(this.sentenceAndOffenceDetails),
        summaryCardElement,
      )
    })
  }
}
