import { CourseUtils, DateUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course } from '@accredited-programmes/models'

export default class SubmittedReferralPersonalDetailsPage extends Page {
  constructor(args: { course: Course }) {
    const { course } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)
  }

  shouldContainImportedFromText(): void {
    cy.get('[data-testid="imported-from-text"]').should(
      'contain.text',
      `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
    )
  }
}
