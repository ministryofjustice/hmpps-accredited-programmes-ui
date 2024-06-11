import { CourseUtils, DrugMisuseUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, DrugAlcoholDetail } from '@accredited-programmes/models'

export default class DrugMisusePage extends Page {
  drugDetails: DrugAlcoholDetail['drug']

  constructor(args: { course: Course; drugDetails: DrugAlcoholDetail['drug'] }) {
    const { course, drugDetails } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.drugDetails = drugDetails
  }

  shouldContainDrugMisuseSummaryList() {
    cy.get('[data-testid="drug-misuse-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(DrugMisuseUtils.summaryListRows(this.drugDetails), summaryListElement)
    })
  }

  shouldContainNoDrugMisuseDataSummaryCard() {
    cy.get('[data-testid="no-drug-misuse-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        '8 - Drug misuse',
        'No drug misuse data found in OASys. Add drug misuse data to OASys to see it here.',
        summaryCardElement,
      )
    })
  }
}
