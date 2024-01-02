import type { Request } from 'express'

import { assessPaths, referPaths } from '../../paths'
import DateUtils from '../dateUtils'
import FormUtils from '../formUtils'
import StringUtils from '../stringUtils'
import type { Course, CourseAudience, Referral, ReferralStatus, ReferralSummary } from '@accredited-programmes/models'
import type { CaseListColumnHeader, MojFrontendNavigationItem, QueryParam, TagColour } from '@accredited-programmes/ui'
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
    return this.selectItems(['Assessment started', 'Awaiting assessment', 'Referral submitted'], selectedValue)
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

  static subNavigationItems(currentPath: Request['path']): Array<MojFrontendNavigationItem> {
    return [
      'open',
      // 'closed',
      'draft',
    ].map(referralStatusGroup => {
      const path = referPaths.caseList.show({ referralStatusGroup })

      return {
        active: currentPath === path,
        href: path,
        text: `${StringUtils.properCase(referralStatusGroup)} referrals`,
      }
    })
  }

  static tableRows(
    referralSummaries: Array<ReferralSummary>,
    columnsToInclude: Array<CaseListColumnHeader>,
  ): Array<GovukFrontendTableRow> {
    return referralSummaries.map(summary => {
      const row: GovukFrontendTableRow = []

      columnsToInclude.forEach(column => {
        switch (column) {
          case 'Conditional release date':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.conditionalReleaseDate },
              text: summary.sentence?.conditionalReleaseDate
                ? DateUtils.govukFormattedFullDateString(summary.sentence.conditionalReleaseDate)
                : 'N/A',
            })
            break
          case 'Date referred':
            row.push({
              attributes: { 'data-sort-value': summary.submittedOn },
              text: summary.submittedOn ? DateUtils.govukFormattedFullDateString(summary.submittedOn) : 'N/A',
            })
            break
          case 'Earliest release date':
            row.push({
              attributes: { 'data-sort-value': summary.earliestReleaseDate },
              text: summary.earliestReleaseDate
                ? DateUtils.govukFormattedFullDateString(summary.earliestReleaseDate)
                : 'N/A',
            })
            break
          case 'Name / Prison number':
            row.push({
              attributes: { 'data-sort-value': CaseListUtils.formattedPrisonerName(summary.prisonerName) },
              html: CaseListUtils.nameAndPrisonNumberHtml(summary),
            })
            break
          case 'Parole eligibility date':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.paroleEligibilityDate },
              text: summary.sentence?.paroleEligibilityDate
                ? DateUtils.govukFormattedFullDateString(summary.sentence.paroleEligibilityDate)
                : 'N/A',
            })
            break
          case 'Programme location':
            row.push({
              attributes: { 'data-sort-value': summary.prisonName },
              text: summary.prisonName || 'N/A',
            })
            break
          case 'Programme name':
            row.push({ text: summary.courseName })
            break
          case 'Programme strand':
            row.push({ text: summary.audiences.map(audience => audience).join(', ') })
            break
          case 'Progress':
            row.push({ text: `${summary.tasksCompleted || 0} out of 4 tasks complete` })
            break
          case 'Referral status':
            row.push({
              attributes: { 'data-sort-value': summary.status },
              html: this.statusTagHtml(summary.status),
            })
            break
          case 'Release date type':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.nonDtoReleaseDateType },
              text: summary.sentence?.nonDtoReleaseDateType
                ? {
                    ARD: 'Automatic Release Date',
                    CRD: 'Conditional Release Date',
                    NPD: 'Non Parole Date',
                    PRRD: 'Post Recall Release Date',
                  }[summary.sentence.nonDtoReleaseDateType]
                : 'N/A',
            })
            break
          case 'Tariff end date':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.tariffExpiryDate },
              text: summary.sentence?.tariffExpiryDate
                ? DateUtils.govukFormattedFullDateString(summary.sentence.tariffExpiryDate)
                : 'N/A',
            })
            break
          default:
        }
      })

      return row
    })
  }

  static uiToApiAudienceQueryParam(uiAudienceQueryParam: string | undefined): string | undefined {
    return uiAudienceQueryParam ? StringUtils.properCase(uiAudienceQueryParam) : undefined
  }

  static uiToApiStatusQueryParam(uiStatusQueryParam: string | undefined): string | undefined {
    return uiStatusQueryParam ? uiStatusQueryParam.toUpperCase().replace(/\s/g, '_') : undefined
  }

  private static formattedPrisonerName(prisonerName: ReferralSummary['prisonerName']): string {
    return StringUtils.convertToTitleCase(
      [prisonerName?.firstName, prisonerName?.lastName].filter(nameComponent => nameComponent).join(' '),
    )
  }

  private static nameAndPrisonNumberHtml(referralSummary: ReferralSummary): string {
    const nameAndPrisonNumberHtmlStart = `<a class="govuk-link" href="${assessPaths.show.personalDetails({
      referralId: referralSummary.id,
    })}">`
    const prisonerName = CaseListUtils.formattedPrisonerName(referralSummary.prisonerName)
    const nameAndPrisonNumberHtmlEnd = prisonerName
      ? `${prisonerName}</a><br>${referralSummary.prisonNumber}`
      : `${referralSummary.prisonNumber}</a>`

    return nameAndPrisonNumberHtmlStart + nameAndPrisonNumberHtmlEnd
  }

  private static selectItems(values: Array<string>, selectedValue?: string): Array<GovukFrontendSelectItem> {
    return FormUtils.getSelectItems(
      Object.fromEntries(values.map(value => [value.toLowerCase(), value])),
      selectedValue,
    )
  }
}
