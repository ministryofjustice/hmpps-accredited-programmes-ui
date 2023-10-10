import { referPaths } from '../paths'
import type { CourseOffering, Organisation, Person, Referral } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithValue,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
} from '@accredited-programmes/ui'

export default class ReferralUtils {
  static applicationSummaryListRows(
    courseOffering: CourseOffering,
    coursePresenter: CoursePresenter,
    organisation: Organisation,
    person: Person,
    username: Express.User['username'],
  ): Array<GovukFrontendSummaryListRowWithValue> {
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
        value: { text: coursePresenter.audiences.map(audience => audience.value).join(', ') },
      },
      {
        key: { text: 'Referrer name' },
        value: { text: username },
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
    return !!referral.oasysConfirmed && !!referral.reason
  }

  static taskListSections(referral: Referral): Array<ReferralTaskListSection> {
    const referralId = referral.id
    const checkAnswersStatus = ReferralUtils.isReadyForSubmission(referral) ? 'not started' : 'cannot start yet'
    const checkAnswersUrl = ReferralUtils.isReadyForSubmission(referral) ? referPaths.checkAnswers({ referralId }) : ''

    return [
      {
        heading: 'Personal details',
        items: [
          {
            statusTag: ReferralUtils.taskListStatusTag('completed'),
            text: 'Confirm personal details',
            url: referPaths.showPerson({ referralId }),
          },
        ],
      },
      {
        heading: 'Referral information',
        items: [
          {
            statusTag: ReferralUtils.taskListStatusTag('not started'),
            text: 'Add Accredited Programme history',
            url: referPaths.programmeHistory.index({ referralId: referral.id }),
          },
          {
            statusTag: ReferralUtils.taskListStatusTag(
              referral.oasysConfirmed ? 'completed' : 'not started',
              'confirm-oasys-tag',
            ),
            text: 'Confirm the OASys information',
            url: referPaths.confirmOasys.show({ referralId }),
          },
          {
            statusTag: ReferralUtils.taskListStatusTag(referral.reason ? 'completed' : 'not started', 'reason-tag'),
            text: 'Add reason for referral and any additional information',
            url: referPaths.reason.show({ referralId }),
          },
        ],
      },
      {
        heading: 'Check answers and submit',
        items: [
          {
            statusTag: ReferralUtils.taskListStatusTag(checkAnswersStatus),
            testIds: ReferralUtils.taskListTestIds('check-answers'),
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
      case 'completed':
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
