import type { Request } from 'express'

import { assessPaths } from '../../paths'
import DateUtils from '../dateUtils'
import FormUtils from '../formUtils'
import StringUtils from '../stringUtils'
import type { Course, CourseAudience, Referral, ReferralStatus, ReferralSummary } from '@accredited-programmes/models'
import type { MojFrontendNavigationItem, QueryParam, TagColour } from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableRow } from '@govuk-frontend'

export default class CaseListUtils {
  static audienceSelectItems(selectedValue?: string): Array<GovukFrontendSelectItem> {
    return this.selectItems(
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

  static primaryNavigationItems(
    currentPath: Request['path'],
    courses: Array<Course>,
  ): Array<MojFrontendNavigationItem> {
    const coursesWithDuplicatesRemoved = courses.filter(
      (course, index, self) => self.findIndex(c => c.name === course.name) === index,
    )
    const sortedCourses = coursesWithDuplicatesRemoved.sort((a, b) => a.name.localeCompare(b.name))

    return sortedCourses.map(course => {
      const path = assessPaths.caseList.show({ courseName: StringUtils.convertToUrlSlug(course.name) })

      return {
        active: currentPath === path,
        href: path,
        text: `${course.name} referrals`,
      }
    })
  }

  static queryParamsExcludingPage(audience?: CourseAudience['value'], status?: Referral['status']): Array<QueryParam> {
    const queryParams: Array<QueryParam> = []

    if (audience) {
      queryParams.push({ key: 'strand', value: audience })
    }

    if (status) {
      queryParams.push({ key: 'status', value: status })
    }

    return queryParams
  }

  static statusSelectItems(selectedValue?: string): Array<GovukFrontendSelectItem> {
    return this.selectItems(
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

  static tableRows(referralSummary: Array<ReferralSummary>): Array<GovukFrontendTableRow> {
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

  static uiToApiAudienceQueryParam(uiAudienceQueryParam: string | undefined): string | undefined {
    return uiAudienceQueryParam ? StringUtils.properCase(uiAudienceQueryParam) : undefined
  }

  static uiToApiStatusQueryParam(uiStatusQueryParam: string | undefined): string | undefined {
    return uiStatusQueryParam ? uiStatusQueryParam.toUpperCase().replace(/\s/g, '_') : undefined
  }

  private static selectItems(values: Array<string>, selectedValue?: string): Array<GovukFrontendSelectItem> {
    return FormUtils.getSelectItems(
      Object.fromEntries(values.map(value => [value.toLowerCase(), value])),
      selectedValue,
    )
  }
}
