import type { Request } from 'express'

import CaseListUtils from './caseListUtils'
import { assessPathBase, assessPaths, referPaths } from '../../paths'
import CourseUtils from '../courseUtils'
import DateUtils from '../dateUtils'
import PniUtils from '../risksAndNeeds/pniUtils'
import StringUtils from '../stringUtils'
import type { CourseOffering, ReferralStatusRefData } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  MojButtonMenu,
  MojFrontendNavigationItem,
  MojTimelineItem,
  ReferralStatusHistoryPresenter,
} from '@accredited-programmes/ui'
import type { Course, Organisation, PniScore, Referral } from '@accredited-programmes-api'
import type { GovukFrontendButton } from '@govuk-frontend'
import type { User, UserEmail } from '@manage-users-api'

export default class ShowReferralUtils {
  static buttonMenu(
    course: Course,
    referral: Referral,
    referencePaths: {
      currentPath: Request['path']
      recentCaseListPath?: string
    },
  ): MojButtonMenu {
    const isAssess = referencePaths.currentPath.startsWith(assessPathBase.pattern)
    const isBuildingChoices = course ? CourseUtils.isBuildingChoices(course?.name) : false
    const isHsp = course ? CourseUtils.isHsp(course?.name) : false
    const { closed, status } = referral

    const menuButtons: Array<GovukFrontendButton> = []

    if (isAssess) {
      menuButtons.push({
        attributes: {
          'aria-disabled': closed,
        },
        classes: 'govuk-button--secondary',
        href: closed ? undefined : assessPaths.updateStatus.decision.show({ referralId: referral.id }),
        text: 'Update status',
      })

      if (status !== 'on_programme' && !closed) {
        if (isBuildingChoices || isHsp) {
          menuButtons.push({
            classes: 'govuk-button--secondary',
            href: assessPaths.updateLdc.show({ referralId: referral.id }),
            text: 'Change LDC status',
          })
        } else {
          menuButtons.push({
            classes: 'govuk-button--secondary',
            href: assessPaths.transfer.show({ referralId: referral.id }),
            text: 'Move to Building Choices',
          })
        }
      }
    }

    return {
      button: { classes: 'govuk-button--secondary', text: 'Update referral' },
      items: menuButtons,
    }
  }

  static buttons(
    referencePaths: {
      currentPath: Request['path']
      recentCaseListPath?: string
    },
    referral: Referral,
    statusTransitions?: Array<ReferralStatusRefData>,
  ): Array<GovukFrontendButton> {
    const isAssess = referencePaths.currentPath.startsWith(assessPathBase.pattern)
    const paths = isAssess ? assessPaths : referPaths
    const { closed } = referral

    const buttons: Array<GovukFrontendButton> = [
      {
        href: referencePaths.recentCaseListPath || paths.caseList.index({}),
        text: 'Back to referrals',
      },
    ]

    if (!isAssess) {
      const holdStatusCode = statusTransitions?.find(transition => transition.hold)?.code
      const releaseStatusCode = statusTransitions?.find(transition => transition.release)?.code
      const nextHoldOrReleaseStatus = holdStatusCode || releaseStatusCode

      const manageHoldHref =
        closed || !nextHoldOrReleaseStatus
          ? undefined
          : `${referPaths.manageHold({ referralId: referral.id })}?status=${nextHoldOrReleaseStatus}`
      const withdrawHref =
        closed || !statusTransitions?.find(transition => transition.code === 'WITHDRAWN')
          ? undefined
          : referPaths.withdraw({ referralId: referral.id })

      buttons.push(
        {
          attributes: {
            'aria-disabled': !manageHoldHref,
          },
          classes: 'govuk-button--secondary',
          href: manageHoldHref,
          text: releaseStatusCode ? 'Remove hold' : 'Put on hold',
        },
        {
          attributes: {
            'aria-disabled': !withdrawHref,
          },
          classes: 'govuk-button--secondary',
          href: withdrawHref,
          text: 'Withdraw referral',
        },
      )
    }

    return buttons
  }

  static courseOfferingSummaryListRows(
    applicantName: User['name'],
    coursePresenter: CoursePresenter,
    contactEmail: CourseOffering['contactEmail'],
    organisationName: Organisation['prisonName'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Applicant name' },
        value: { text: applicantName },
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
        value: { text: organisationName },
      },
      {
        key: { text: 'Programme team email address' },
        value: { html: `<a href="mailto:${contactEmail}">${contactEmail}</a>` },
      },
    ]
  }

  static pniMismatchSummaryListRows(
    recommendedPathway?: PniScore['programmePathway'],
    requestedPathway?: Course['intensity'],
    referrerOverrideReason?: Referral['referrerOverrideReason'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: { text: 'Recommended pathway' },
        value: { text: PniUtils.formatPathwayValue(recommendedPathway) },
      },
      {
        key: { text: 'Requested pathway' },
        value: { text: CourseUtils.formatIntensityValue(requestedPathway) },
      },
      {
        key: { text: 'Reason given by referrer' },
        value: { text: referrerOverrideReason || '' },
      },
    ]
  }

  static statusHistoryTimelineItems(
    statusHistoryPresenter: Array<ReferralStatusHistoryPresenter>,
    originalReferralHref?: string,
    originalCourseName?: string,
  ): Array<MojTimelineItem> {
    return statusHistoryPresenter.map((status, index) => {
      let html = CaseListUtils.statusTagHtml(status.statusColour, status.statusDescription)

      const additionalTextItems = [
        { label: 'Reason', value: status.reasonDescription },
        { label: 'Status details', value: status.notes },
      ].filter(item => Boolean(item.value))

      if (additionalTextItems.length) {
        html = html.concat(
          `<dl class="govuk-!-margin-top-4 govuk-!-margin-bottom-0">
          ${additionalTextItems.map(item => `<div><dt class="govuk-!-display-inline govuk-!-font-weight-bold">${item.label}:</dt><dd class="govuk-!-display-inline govuk-!-margin-left-1">${item.value}</dd></div>`).join('')}
          </dl>`,
        )
      }

      if (originalReferralHref && index === statusHistoryPresenter.length - 1) {
        html = html.concat(
          `<hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible">This referral was transferred from ${originalCourseName}. See <a href="${originalReferralHref}">previous referral details</a>`,
        )
      }

      return {
        byline: {
          text: status.byLineText,
        },
        datetime: {
          timestamp: DateUtils.removeTimezoneOffset(status.statusStartDate as string),
          type: 'datetime',
        },
        html,
        label: {
          text: status.status?.toLowerCase() === 'referral_submitted' ? 'Referral submitted' : 'Status update',
        },
      }
    })
  }

  static submissionSummaryListRows(
    referralSubmissionDate: Referral['submittedOn'],
    referrerName: User['name'],
    referrerEmail: UserEmail['email'],
    prisonOffenderManager?: Referral['primaryPrisonOffenderManager'],
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const pomNotAssignedString = 'Not assigned'

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
      {
        key: { text: 'Referrer email address' },
        value: { html: `<a href="mailto:${referrerEmail}">${referrerEmail}</a>` },
      },

      {
        key: { text: 'Prison Offender Manager' },
        value: {
          text:
            prisonOffenderManager?.firstName || prisonOffenderManager?.lastName
              ? StringUtils.convertToTitleCase(`${prisonOffenderManager?.firstName} ${prisonOffenderManager?.lastName}`)
              : pomNotAssignedString,
        },
      },
      {
        key: { text: 'Prison Offender Manager email address' },
        value: {
          ...(prisonOffenderManager?.primaryEmail
            ? {
                html: `<a href="mailto:${prisonOffenderManager.primaryEmail}">${prisonOffenderManager.primaryEmail}</a>`,
              }
            : { text: pomNotAssignedString }),
        },
      },
    ]
  }

  static subNavigationItems(
    currentPath: Request['path'],
    currentSection: 'pni' | 'referral' | 'risksAndNeeds' | 'statusHistory',
    referralId: Referral['id'],
  ): Array<MojFrontendNavigationItem> {
    const isAssess = currentPath.startsWith(assessPathBase.pattern)
    const paths = isAssess ? assessPaths : referPaths

    const pniLink: MojFrontendNavigationItem = {
      active: currentSection === 'pni',
      href: assessPaths.show.pni({ referralId }),
      text: 'Programme needs identifier',
    }

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
      navigationItems.push(pniLink, statusHistoryLink)
    } else {
      navigationItems.unshift(statusHistoryLink)
    }

    return navigationItems
  }

  static viewReferralNavigationItems(
    currentPath: Request['path'],
    referralId: Referral['id'],
    showHspItem?: boolean,
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
        href: paths.show.releaseDates({ referralId }),
        text: 'Release dates',
      },
      {
        href: paths.show.additionalInformation({ referralId }),
        text: 'Additional information',
      },
      {
        href: paths.show.otherReferrals({ referralId }),
        text: 'Other referrals',
      },
    ]
    if (showHspItem) {
      navigationItems.push({
        href: paths.show.hspDetails({ referralId }),
        text: 'HSP details',
      })
    }

    return navigationItems.map(item => ({
      ...item,
      active: currentPath === item.href,
      href: `${item.href}#content`,
    }))
  }
}
