import { CourseUtils, DateUtils, PersonUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Person } from '@accredited-programmes/models'

export default class PersonalDetailsPage extends Page {
  person: Person

  constructor(args: { course: Course; person: Person }) {
    const { course, person } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.person = person
  }

  shouldContainImportedFromText(): void {
    cy.get('[data-testid="imported-from-text"]').should(
      'contain.text',
      `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
    )
  }

  shouldContainPersonalDetailsSummaryCard(): void {
    cy.get('[data-testid="personal-details-summary-card"]').then(summaryCardElement => {
      this.shouldContainSummaryCard(
        'Personal details',
        [],
        PersonUtils.summaryListRows(this.person),
        summaryCardElement,
      )
    })
  }
}