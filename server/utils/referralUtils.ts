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
          {
            statusTag: ReferralUtils.taskListStatus('not started'),
            text: 'Confirm the OASys information',
            url: referPaths.confirmOasys({ referralId: referral.id }),
          },
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
          {
            statusTag: ReferralUtils.taskListStatus('cannot start yet'),
            text: 'Check answers and submit',
            url: referPaths.checkAnswers({ referralId: referral.id }),
          },
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
