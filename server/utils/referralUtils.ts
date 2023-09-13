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
    const checkAnswersStatus = ReferralUtils.isReadyForSubmission(referral) ? 'not started' : 'cannot start yet'
    const checkAnswersUrl = ReferralUtils.isReadyForSubmission(referral)
      ? referPaths.checkAnswers({ referralId: referral.id })
      : ''

    return [
      {
        heading: 'Personal details',
        items: [
          {
            statusTag: ReferralUtils.taskListStatus('completed'),
            text: 'Confirm personal details',
            url: referPaths.showPerson({ referralId: referral.id }),
          },
        ],
      },
      {
        heading: 'Referral information',
        items: [
          {
            statusTag: ReferralUtils.taskListStatus(referral.reason ? 'completed' : 'not started', 'reason-tag'),
            text: 'Add reason for referral and any additional information',
            url: referPaths.reason({ referralId: referral.id }),
          },
          {
            statusTag: ReferralUtils.taskListStatus('not started'),
            text: 'Add Accredited Programme history',
            url: '#',
          },
          {
            statusTag: ReferralUtils.taskListStatus(
              referral.oasysConfirmed ? 'completed' : 'not started',
              'oasys-confirmed-tag',
            ),
            text: 'Confirm the OASys information',
            url: referPaths.confirmOasys({ referralId: referral.id }),
          },
        ],
      },
      {
        heading: 'Check answers and submit',
        items: [
          {
            statusTag: ReferralUtils.taskListStatus(checkAnswersStatus),
            testIds: ReferralUtils.testIds('check-answers'),
            text: 'Check answers and submit',
            url: checkAnswersUrl,
          },
        ],
      },
    ]
  }

  private static taskListStatus(text: ReferralTaskListStatusText, dataTestId?: string): ReferralTaskListStatusTag {
    let classes = 'moj-task-list__task-completed'

    if (text !== 'completed') {
      classes = `govuk-tag--grey ${classes}`
    }

    const tag: ReferralTaskListStatusTag = { classes, text }

    if (dataTestId) {
      tag.attributes = { 'data-testid': dataTestId }
    }

    return tag
  }

  private static testIds(base: string): { listItem: string } {
    return { listItem: `${base}-list-item` }
  }
}
