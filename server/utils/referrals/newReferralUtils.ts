import { referPaths } from '../../paths'
import type { CourseOffering, Organisation, Person, Referral } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
} from '@accredited-programmes/ui'
import type { User } from '@manage-users-api'

export default class NewReferralUtils {
  static applicationSummaryListRows(
    courseOffering: CourseOffering,
    coursePresenter: CoursePresenter,
    organisation: Organisation,
    person: Person,
    referrerName: User['name'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Applicant name' },
        value: { text: person.name },
      },
      {
        key: { text: 'Programme name' },
        value: { text: coursePresenter.nameAndAlternateName },
      },
      {
        key: { text: 'Programme strand' },
        value: { text: coursePresenter.audience },
      },
      {
        key: { text: 'Referrer name' },
        value: { text: referrerName },
      },
      {
        key: { text: 'Referring prison' },
        value: { text: organisation.name },
      },
      {
        key: { text: 'Contact email address' },
        value: { text: courseOffering.contactEmail },
      },
    ]
  }

  static isReadyForSubmission(referral: Referral): boolean {
    return referral.hasReviewedProgrammeHistory && referral.oasysConfirmed && !!referral.additionalInformation
  }

  static taskListSections(referral: Referral): Array<ReferralTaskListSection> {
    const referralId = referral.id
    const checkAnswersStatus = NewReferralUtils.isReadyForSubmission(referral) ? 'Not started' : 'Cannot start yet'
    const checkAnswersUrl = NewReferralUtils.isReadyForSubmission(referral)
      ? referPaths.new.checkAnswers({ referralId })
      : ''

    return [
      {
        heading: 'Personal details',
        items: [
          {
            statusTag: NewReferralUtils.taskListStatusTag('Completed'),
            text: 'Confirm personal details',
            url: referPaths.new.showPerson({ referralId }),
          },
        ],
      },
      {
        heading: 'Referral information',
        items: [
          {
            statusTag: NewReferralUtils.taskListStatusTag(
              referral.hasReviewedProgrammeHistory ? 'Completed' : 'Not started',
              'programme-history-tag',
            ),
            text: 'Review Accredited Programme history',
            url: referPaths.new.programmeHistory.index({ referralId: referral.id }),
          },
          {
            statusTag: NewReferralUtils.taskListStatusTag(
              referral.oasysConfirmed ? 'Completed' : 'Not started',
              'confirm-oasys-tag',
            ),
            text: 'Confirm the OASys information',
            url: referPaths.new.confirmOasys.show({ referralId }),
          },
          {
            statusTag: NewReferralUtils.taskListStatusTag(
              referral.additionalInformation ? 'Completed' : 'Not started',
              'additional-information-tag',
            ),
            text: 'Add additional information',
            url: referPaths.new.additionalInformation.show({ referralId }),
          },
        ],
      },
      {
        heading: 'Check answers and submit',
        items: [
          {
            statusTag: NewReferralUtils.taskListStatusTag(checkAnswersStatus),
            testIds: NewReferralUtils.taskListTestIds('check-answers'),
            text: 'Check answers and submit',
            url: checkAnswersUrl,
          },
        ],
      },
    ]
  }

  private static taskListStatusTag(text: ReferralTaskListStatusText, dataTestId?: string): ReferralTaskListStatusTag {
    const baseClasses = 'moj-task-list__task-completed'
    const incompleteClasses = `govuk-tag--grey ${baseClasses}`

    let tag: ReferralTaskListStatusTag

    switch (text) {
      case 'Completed':
        tag = { classes: baseClasses, text }
        break
      default:
        tag = { classes: incompleteClasses, text }
        break
    }

    if (dataTestId) {
      tag.attributes = { 'data-testid': dataTestId }
    }

    return tag
  }

  private static taskListTestIds(base: string): { listItem: string } {
    return { listItem: `${base}-list-item` }
  }
}
