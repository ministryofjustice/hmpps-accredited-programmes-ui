import { referPaths } from '../../paths'
import type { CourseOffering, Organisation, Person } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
} from '@accredited-programmes/ui'
import type { Referral } from '@accredited-programmes-api'
import type { User, UserEmail } from '@manage-users-api'

export default class NewReferralUtils {
  static courseOfferingSummaryListRows(
    courseOffering: CourseOffering,
    coursePresenter: CoursePresenter,
    organisation: Organisation,
    person: Person,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Applicant name' },
        value: { text: person.name },
      },
      {
        key: { text: 'Programme name' },
        value: { text: coursePresenter.displayName },
      },
      {
        key: { text: 'Programme strand' },
        value: { text: coursePresenter.audience },
      },
      {
        key: { text: 'Programme location' },
        value: { text: organisation.name },
      },
      {
        key: { text: 'Programme team email address' },
        value: { html: `<a href="mailto:${courseOffering.contactEmail}">${courseOffering.contactEmail}</a>` },
      },
    ]
  }

  static isReadyForSubmission(referral: Referral): boolean {
    return (
      referral.hasReviewedProgrammeHistory && referral.oasysConfirmed && !!referral.hasReviewedAdditionalInformation
    )
  }

  static referrerSummaryListRows(
    referrerName: User['name'],
    referrerEmail: UserEmail['email'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Referrer name' },
        value: { text: referrerName },
      },
      {
        key: { text: 'Referrer email address' },
        value: { html: `<a href="mailto:${referrerEmail}">${referrerEmail}</a>` },
      },
    ]
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
            statusTag: NewReferralUtils.taskListStatusTag('Completed', 'confirm-personal-details-tag'),
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
            text: 'Check risks and needs information (OASys)',
            url: referPaths.new.confirmOasys.show({ referralId }),
          },
          {
            statusTag: NewReferralUtils.taskListStatusTag(
              referral.hasReviewedAdditionalInformation ? 'Completed' : 'Not started',
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
            statusTag: NewReferralUtils.taskListStatusTag(checkAnswersStatus, 'check-answers-tag'),
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
      tag.attributes = {
        'data-testid': dataTestId,
        id: dataTestId,
      }
    }

    return tag
  }
}
