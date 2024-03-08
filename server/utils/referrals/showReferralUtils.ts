import type { Request } from 'express'

import CaseListUtils from './caseListUtils'
import { assessPathBase, assessPaths, referPaths } from '../../paths'
import DateUtils from '../dateUtils'
import type { Organisation, Referral } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  MojFrontendNavigationItem,
  MojTimelineItem,
  ReferralStatusHistoryPresenter,
} from '@accredited-programmes/ui'
import type { GovukFrontendButton } from '@govuk-frontend'
import type { User } from '@manage-users-api'

export default class ShowReferralUtils {
  static buttons(currentPath: Request['path'], referral: Referral): Array<GovukFrontendButton> {
    const isAssess = currentPath.startsWith(assessPathBase.pattern)
    const paths = isAssess ? assessPaths : referPaths
    const { closed } = referral

    const buttons: Array<GovukFrontendButton> = [
      {
        href: paths.caseList.index({}),
        text: 'Back to my referrals',
      },
    ]

    if (isAssess) {
      buttons.push({
        classes: 'govuk-button--secondary',
        disabled: closed,
        href: closed ? undefined : assessPaths.updateStatus.decision.show({ referralId: referral.id }),
        text: 'Update status',
      })
    } else {
      buttons.push({
        classes: 'govuk-button--secondary',
        disabled: closed,
        href: closed ? undefined : referPaths.withdraw.category({ referralId: referral.id }),
        text: 'Withdraw referral',
      })
    }

    return buttons
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
        value: { text: coursePresenter.audience },
      },
      {
        key: { text: 'Programme location' },
        value: { text: organisationName },
      },
    ]
  }

  static statusHistoryTimelineItems(
    statusHistoryPresenter: Array<ReferralStatusHistoryPresenter>,
  ): Array<MojTimelineItem> {
    return statusHistoryPresenter.map(status => {
      const html = CaseListUtils.statusTagHtml(status.statusColour, status.statusDescription)

      return {
        byline: {
          text: status.byLineText,
        },
        datetime: {
          timestamp: status.statusStartDate as string,
          type: 'datetime',
        },
        html: status.notes
          ? html.concat(
              `<p class="govuk-!-margin-top-4 govuk-!-margin-bottom-0"><strong>Status details: </strong>${status.notes}</p>`,
            )
          : html,
        label: {
          text: status.status?.toLowerCase() === 'referral_submitted' ? 'Referral submitted' : 'Status update',
        },
      }
    })
  }

  static submissionSummaryListRows(
    referralSubmissionDate: Referral['submittedOn'],
    referrerName: User['name'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Date referred' },
        value: {
          text: referralSubmissionDate ? DateUtils.govukFormattedFullDateString(referralSubmissionDate) : 'Not known',
        },
      },
      {
        key: { text: 'Referrer name' },
        value: { text: referrerName },
      },
    ]
  }

  static subNavigationItems(
    currentPath: Request['path'],
    currentSection: 'referral' | 'risksAndNeeds' | 'statusHistory',
    referralId: Referral['id'],
  ): Array<MojFrontendNavigationItem> {
    const isAssess = currentPath.startsWith(assessPathBase.pattern)
    const paths = isAssess ? assessPaths : referPaths

    const statusHistoryLink: MojFrontendNavigationItem = {
      active: currentSection === 'statusHistory',
      href: paths.show.statusHistory({ referralId }),
      text: 'Status history',
    }

    const navigationItems: Array<MojFrontendNavigationItem> = [
      {
        active: currentSection === 'referral',
        href: paths.show.personalDetails({ referralId }),
        text: 'Referral details',
      },
      {
        active: currentSection === 'risksAndNeeds',
        href: paths.show.risksAndNeeds.risksAndAlerts({ referralId }),
        text: 'Risks and needs',
      },
    ]

    if (isAssess) {
      navigationItems.push(statusHistoryLink)
    } else {
      navigationItems.unshift(statusHistoryLink)
    }

    return navigationItems
  }

  static viewReferralNavigationItems(
    currentPath: Request['path'],
    referralId: Referral['id'],
  ): Array<MojFrontendNavigationItem> {
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
}
