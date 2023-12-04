import type { Request } from 'express'

import DateUtils from './dateUtils'
import FormUtils from './formUtils'
import StringUtils from './stringUtils'
import { assessPaths, referPaths } from '../paths'
import { assessPathBase } from '../paths/assess'
import type {
  CourseOffering,
  Organisation,
  Person,
  Referral,
  ReferralStatus,
  ReferralSummary,
} from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  MojFrontendSideNavigationItem,
  ReferralTaskListSection,
  ReferralTaskListStatusTag,
  ReferralTaskListStatusText,
  TagColour,
} from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableRow } from '@govuk-frontend'

export default class ReferralUtils {
  static applicationSummaryListRows(
    courseOffering: CourseOffering,
    coursePresenter: CoursePresenter,
    organisation: Organisation,
    person: Person,
    username: Express.User['username'],
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

  static audienceSelectItems(selectedValue?: string): Array<GovukFrontendSelectItem> {
    return this.caseListSelectItems(
      [
        'Extremism offence',
        'Gang offence',
        'General offence',
        'General violence offence',
        'Intimate partner violence offence',
        'Sexual offence',
      ],
      selectedValue,
    )
  }

  static caseListTableRows(referralSummary: Array<ReferralSummary>): Array<GovukFrontendTableRow> {
    return referralSummary.map(summary => [
      {
        attributes: {
          'data-sort-value': summary.prisonNumber,
        },
        html: `<a class="govuk-link" href="${assessPaths.show.personalDetails({ referralId: summary.id })}">${
          summary.prisonNumber
        }</a>`,
      },
      {
        attributes: {
          'data-sort-value': summary.submittedOn,
        },
        text: summary.submittedOn ? DateUtils.govukFormattedFullDateString(summary.submittedOn) : 'N/A',
      },
      {
        text: summary.courseName,
      },
      {
        text: summary.audiences.map(audience => audience).join(', '),
      },
      {
        attributes: {
          'data-sort-value': summary.status,
        },
        html: this.statusTagHtml(summary.status),
      },
    ])
  }

  static courseOfferingSummaryListRows(
    coursePresenter: CoursePresenter,
    organisationName: Organisation['name'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Programme name' },
        value: { text: coursePresenter.nameAndAlternateName },
      },
      {
        key: { text: 'Programme strand' },
        value: { text: coursePresenter.audiences.map(audience => audience.value).join(', ') },
      },
      {
        key: { text: 'Programme location' },
        value: { text: organisationName },
      },
    ]
  }

  static isReadyForSubmission(referral: Referral): boolean {
    return referral.hasReviewedProgrammeHistory && referral.oasysConfirmed && !!referral.additionalInformation
  }

  static statusSelectItems(selectedValue?: string): Array<GovukFrontendSelectItem> {
    return this.caseListSelectItems(
      ['Assessment started', 'Awaiting assessment', 'Referral started', 'Referral submitted'],
      selectedValue,
    )
  }

  static statusTagHtml(status: ReferralStatus): string {
    let colour: TagColour
    let text: string

    switch (status) {
      case 'assessment_started':
        colour = 'yellow'
        text = 'Assessment started'
        break
      case 'awaiting_assessment':
        colour = 'orange'
        text = 'Awaiting assessment'
        break
      case 'referral_submitted':
        colour = 'red'
        text = 'Referral submitted'
        break
      default:
        colour = 'grey'
        text = status
        break
    }

    return `<strong class="govuk-tag govuk-tag--${colour}">${text}</strong>`
  }

  static submissionSummaryListRows(referral: Referral): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Date referred' },
        value: { text: DateUtils.govukFormattedFullDateString(referral.submittedOn) },
      },
    ]
  }

  static taskListSections(referral: Referral): Array<ReferralTaskListSection> {
    const referralId = referral.id
    const checkAnswersStatus = ReferralUtils.isReadyForSubmission(referral) ? 'not started' : 'cannot start yet'
    const checkAnswersUrl = ReferralUtils.isReadyForSubmission(referral)
      ? referPaths.new.checkAnswers({ referralId })
      : ''

    return [
      {
        heading: 'Personal details',
        items: [
          {
            statusTag: ReferralUtils.taskListStatusTag('completed'),
            text: 'Confirm personal details',
            url: referPaths.new.showPerson({ referralId }),
          },
        ],
      },
      {
        heading: 'Referral information',
        items: [
          {
            statusTag: ReferralUtils.taskListStatusTag(
              referral.hasReviewedProgrammeHistory ? 'completed' : 'not started',
              'programme-history-tag',
            ),
            text: 'Review Accredited Programme history',
            url: referPaths.new.programmeHistory.index({ referralId: referral.id }),
          },
          {
            statusTag: ReferralUtils.taskListStatusTag(
              referral.oasysConfirmed ? 'completed' : 'not started',
              'confirm-oasys-tag',
            ),
            text: 'Confirm the OASys information',
            url: referPaths.new.confirmOasys.show({ referralId }),
          },
          {
            statusTag: ReferralUtils.taskListStatusTag(
              referral.additionalInformation ? 'completed' : 'not started',
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
            statusTag: ReferralUtils.taskListStatusTag(checkAnswersStatus),
            testIds: ReferralUtils.taskListTestIds('check-answers'),
            text: 'Check answers and submit',
            url: checkAnswersUrl,
          },
        ],
      },
    ]
  }

  static uiToApiAudienceQueryParam(uiAudienceQueryParam: string | undefined): string | undefined {
    return uiAudienceQueryParam ? StringUtils.properCase(uiAudienceQueryParam) : undefined
  }

  static uiToApiStatusQueryParam(uiStatusQueryParam: string | undefined): string | undefined {
    return uiStatusQueryParam ? uiStatusQueryParam.toUpperCase().replace(/\s/g, '_') : undefined
  }

  static viewReferralNavigationItems(
    currentPath: Request['path'],
    referralId: Referral['id'],
  ): Array<MojFrontendSideNavigationItem> {
    const paths = currentPath.startsWith(assessPathBase.pattern) ? assessPaths : referPaths

    const navigationItems = [
      {
        href: paths.show.personalDetails({ referralId }),
        text: 'Personal details',
      },
      {
        href: paths.show.programmeHistory({ referralId }),
        text: 'Programme history',
      },
      {
        href: paths.show.offenceHistory({ referralId }),
        text: 'Offence history',
      },
      {
        href: paths.show.sentenceInformation({ referralId }),
        text: 'Sentence information',
      },
      {
        href: paths.show.additionalInformation({ referralId }),
        text: 'Additional information',
      },
    ]

    return navigationItems.map(item => ({
      ...item,
      active: currentPath === item.href,
    }))
  }

  private static caseListSelectItems(values: Array<string>, selectedValue?: string): Array<GovukFrontendSelectItem> {
    return FormUtils.getSelectItems(
      Object.fromEntries(values.map(value => [value.toLowerCase(), value])),
      selectedValue,
    )
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
