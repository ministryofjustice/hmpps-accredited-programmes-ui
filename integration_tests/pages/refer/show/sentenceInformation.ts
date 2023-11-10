import { CourseUtils, DateUtils, SentenceInformationUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Person } from '@accredited-programmes/models'
import type { OffenderSentenceAndOffences } from '@prison-api'

export default class SentenceInformationPage extends Page {
  person: Person

  sentenceAndOffenceDetails: OffenderSentenceAndOffences

  constructor(args: { course: Course; person: Person; sentenceAndOffenceDetails: OffenderSentenceAndOffences }) {
    const { course, person, sentenceAndOffenceDetails } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.person = person
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
        SentenceInformationUtils.detailsSummaryListRows(
          this.person.sentenceStartDate,
          this.sentenceAndOffenceDetails.sentenceTypeDescription,
        ),
        summaryCardElement,
      )
    })
  }
}
