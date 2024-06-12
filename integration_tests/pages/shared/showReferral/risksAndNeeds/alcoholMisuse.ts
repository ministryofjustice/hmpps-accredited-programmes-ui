import { AlcoholMisuseUtils, CourseUtils } from '../../../../../server/utils'
import Page from '../../../page'
import type { Course, DrugAlcoholDetail } from '@accredited-programmes/models'

export default class AlcoholMisusePage extends Page {
  alcoholDetails: DrugAlcoholDetail['alcohol']

  constructor(args: { alcoholDetails: DrugAlcoholDetail['alcohol']; course: Course }) {
    const { alcoholDetails, course } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.alcoholDetails = alcoholDetails
  }

  shouldContainAlcoholMisuseSummaryList() {
    cy.get('[data-testid="alcohol-misuse-summary-list"]').then(summaryListElement => {
      this.shouldContainSummaryListRows(AlcoholMisuseUtils.summaryListRows(this.alcoholDetails), summaryListElement)
    })
  }

  shouldContainNoAlcoholMisuseDataSummaryCard() {
    cy.get('[data-testid="no-alcohol-misuse-data-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        '9 - Alcohol misuse',
        'No alcohol misuse data found in OASys. Add alcohol misuse data to OASys to see it here.',
        summaryCardElement,
      )
    })
  }
}
