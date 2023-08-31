import type { Referral } from '@accredited-programmes/models'
import type {
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
} from '@accredited-programmes/ui'

export default class ReferralUtils {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  static taskListSections(referral: Referral): Array<ReferralTaskListSection> {
    return [
      {
        heading: 'Personal details',
        items: [{ statusTag: ReferralUtils.taskListStatus('completed'), text: 'Confirm personal details' }],
      },
      {
        heading: 'Referral information',
        items: [
          {
            statusTag: ReferralUtils.taskListStatus('not started'),
            text: 'Add Accredited Programme history',
            url: '#',
          },
          { statusTag: ReferralUtils.taskListStatus('not started'), text: 'Confirm the OASys information', url: '#' },
          {
            statusTag: ReferralUtils.taskListStatus('not started'),
            text: 'Add reason for referral and any additional information',
            url: '#',
          },
        ],
      },
      {
        heading: 'Check answers and submit',
        items: [
          { statusTag: ReferralUtils.taskListStatus('cannot start yet'), text: 'Check answers and submit', url: '#' },
        ],
      },
    ]
  }

  private static taskListStatus(text: ReferralTaskListStatusText): ReferralTaskListStatusTag {
    const classes =
      text === 'completed'
        ? 'govuk-tag moj-task-list__task-completed'
        : 'govuk-tag govuk-tag--grey moj-task-list__task-completed'

    return { classes, text } as ReferralTaskListStatusTag
  }
}
