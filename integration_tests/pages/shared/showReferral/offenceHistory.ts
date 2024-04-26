import { CourseUtils, OffenceUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Person } from '@accredited-programmes/models'
import type { InmateDetail, OffenceDto } from '@prison-api'

export default class OffenceHistoryPage extends Page {
  offenceCodes?: Array<OffenceDto>

  offenderBooking: InmateDetail

  person: Person

  constructor(args: {
    course: Course
    offenderBooking: InmateDetail
    person: Person
    offenceCodes?: Array<OffenceDto>
  }) {
    const { course, offenderBooking, person } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.offenceCodes = args.offenceCodes
    this.offenderBooking = offenderBooking
    this.person = person
  }

  shouldContainAdditionalOffenceSummaryCards(): void {
    const additionalOffences = this.offenderBooking.offenceHistory?.filter(offence => !offence.mostSerious)

    additionalOffences?.forEach((offence, index) => {
      const offenceCode = this.offenceCodes?.find(offenceDto => offenceDto.code === offence.offenceCode)

      cy.get(`[data-testid="additional-offence-summary-card-${index + 1}"]`).then(summaryCardElement => {
        this.shouldContainSummaryCard(
          `Additional offence${offenceCode?.code ? ` (${offenceCode.code})` : ''}`,
          [],
          OffenceUtils.summaryListRows({
            code: offenceCode?.code,
            date: offence.offenceDate,
            description: offenceCode?.description,
            mostSerious: offence.mostSerious,
            statuteCodeDescription: offenceCode?.statuteCode.description,
          }),
          summaryCardElement,
        )
      })
    })
  }

  shouldContainIndexOffenceSummaryCard(): void {
    const indexOffence = this.offenderBooking.offenceHistory?.find(offence => offence.mostSerious)
    const offenceCode = this.offenceCodes?.find(offenceDto => offenceDto.code === indexOffence?.offenceCode)

    cy.get('[data-testid="index-offence-summary-card"]').then(summaryCardElement => {
      this.shouldContainSummaryCard(
        'Index offence',
        [],
        OffenceUtils.summaryListRows({
          code: offenceCode?.code,
          date: indexOffence?.offenceDate,
          description: offenceCode?.description,
          mostSerious: indexOffence?.mostSerious,
          statuteCodeDescription: offenceCode?.statuteCode.description,
        }),
        summaryCardElement,
      )
    })
  }

  shouldContainNoOffenceHistoryMessage(): void {
    cy.get('[data-testid="no-offence-history-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Offence history',
        `There is no Offence history for ${this.person.name}.`,
        summaryCardElement,
      )
    })
  }
}
