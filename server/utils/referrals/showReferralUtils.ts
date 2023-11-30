import type { Request } from 'express'

import { assessPathBase, assessPaths, referPaths } from '../../paths'
import DateUtils from '../dateUtils'
import type { Organisation, Referral } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  MojFrontendSideNavigationItem,
} from '@accredited-programmes/ui'

export default class ShowReferralUtils {
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

  static submissionSummaryListRows(referral: Referral): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Date referred' },
        value: { text: DateUtils.govukFormattedFullDateString(referral.submittedOn) },
      },
    ]
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
}