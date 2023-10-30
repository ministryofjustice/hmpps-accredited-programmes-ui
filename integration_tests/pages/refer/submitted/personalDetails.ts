import { CourseUtils, DateUtils } from '../../../../server/utils'
import Page from '../../page'
import type { Course, Organisation, Referral } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class SubmittedReferralPersonalDetailsPage extends Page {
  course: CoursePresenter

  organisation: Organisation

  referral: Referral

  constructor(args: { course: Course; organisation: Organisation; referral: Referral }) {
    const { course, organisation, referral } = args
    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.nameAndAlternateName}`)

    this.course = coursePresenter
    this.organisation = organisation
    this.referral = referral
  }

  shouldContainImportedFromText(): void {
    cy.get('[data-testid="imported-from-text"]').should(
      'contain.text',
      `Imported from Nomis on ${DateUtils.govukFormattedFullDateString()}.`,
    )
  }
}
