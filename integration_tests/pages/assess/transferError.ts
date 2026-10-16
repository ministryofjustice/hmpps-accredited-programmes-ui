import { assessPaths } from '../../../server/paths'
import Page from '../page'
import type { Person } from '@accredited-programmes/models'
import type { Course, Organisation, Referral } from '@accredited-programmes-api'

export default class TransferErrorPage extends Page {
  organisation: Organisation

  originalCourse: Course

  person: Person

  referral: Referral

  constructor(args: {
    organisation: Organisation
    originalCourse: Course
    person: Person
    referral: Referral
    title?: string
  }) {
    const { organisation, originalCourse, title, person, referral } = args

    super(title || 'This referral cannot be moved to Building Choices')

    this.organisation = organisation
    this.originalCourse = originalCourse
    this.person = person
    this.referral = referral
  }

  shouldContainMissingInformationErrorText() {
    this.shouldContainText(
      `This referral cannot be moved. Risk and need scores are missing for ${this.person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
    )
    this.shouldContainText('You can see which scores are missing in the programme needs identifier.')
    this.shouldContainLink('programme needs identifier', assessPaths.show.pni({ referralId: this.referral.id }))
    this.shouldContainText(
      'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
    )
  }

  shouldContainNoCourseText() {
    this.shouldContainText(
      `This referral cannot be moved because ${this.organisation.prisonName} does not offer the general offence strand of Building Choices: ${this.originalCourse.intensity?.toLowerCase()} intensity.`,
    )
    this.shouldContainText('Close this referral and submit a new one to a different location.')
  }

  shouldContainNotEligibleErrorText() {
    this.shouldContainText(
      `This referral cannot be moved because the risk and need scores suggest that ${this.person.name} is not eligible for Building Choices. You can see these scores in the programme needs identifier`,
    )
  }

  shouldContainReturnToReferralButton() {
    this.shouldContainButtonLink(
      'Return to referral details',
      assessPaths.show.personalDetails({ referralId: this.referral.id }),
    )
  }
}
