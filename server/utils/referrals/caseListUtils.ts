import type { Request } from 'express'

import { assessPaths, referPaths } from '../../paths'
import DateUtils from '../dateUtils'
import FormUtils from '../formUtils'
import StringUtils from '../stringUtils'
import type { Course, ReferralStatus, ReferralSummary } from '@accredited-programmes/models'
import type { CaseListColumnHeader, MojFrontendNavigationItem, QueryParam, TagColour } from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableHeadElement, GovukFrontendTableRow } from '@govuk-frontend'

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

  static queryParamsExcludingPage(
    audience?: string,
    status?: string,
    sortColumn?: string,
    sortDirection?: string,
  ): Array<QueryParam> {
    const queryParams: Array<QueryParam> = []

    if (audience) {
      queryParams.push({ key: 'strand', value: audience })
    }

    if (status) {
      queryParams.push({ key: 'status', value: status })
    }

    if (sortColumn && sortDirection) {
      queryParams.push({ key: 'sortColumn', value: sortColumn })
      queryParams.push({ key: 'sortDirection', value: sortDirection })
    }

    return queryParams
  }

  static queryParamsExcludingSort(audience?: string, status?: string, page?: string): Array<QueryParam> {
    const queryParams: Array<QueryParam> = []

    if (audience) {
      queryParams.push({ key: 'strand', value: audience })
    }

    if (status) {
      queryParams.push({ key: 'status', value: status })
    }

    if (page) {
      queryParams.push({ key: 'page', value: page })
    }

    return queryParams
  }

  static sortableTableHeadings(
    basePath: string,
    columns: Record<string, CaseListColumnHeader>,
    sortColumn: string = 'surname',
    sortDirection: string = 'ascending',
  ): Array<GovukFrontendTableHeadElement> {
    return Object.entries(columns).map(([key, value]) => {
      let ariaSortDirection: 'ascending' | 'descending' | 'none' = 'none'
      const columnIsCurrentlySorted = key === sortColumn

      if (columnIsCurrentlySorted) {
        ariaSortDirection = sortDirection === 'ascending' ? 'ascending' : 'descending'
      }

      const hrefPrefix = basePath.includes('?') ? `${basePath}&` : `${basePath}?`

      return {
        attributes: { 'aria-sort': ariaSortDirection },
        html: `<a class="govuk-link--no-visited-state" href="${hrefPrefix}sortColumn=${key}&sortDirection=${
          ariaSortDirection === 'ascending' ? 'descending' : 'ascending'
        }">${value}</a>`,
      }
    })
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

  static tableRowContent(
    referralSummary: ReferralSummary,
    column: CaseListColumnHeader,
    paths: typeof assessPaths | typeof referPaths = assessPaths,
  ): string {
    switch (column) {
      case 'Conditional release date':
        return referralSummary.sentence?.conditionalReleaseDate
          ? DateUtils.govukFormattedFullDateString(referralSummary.sentence.conditionalReleaseDate)
          : 'N/A'
      case 'Date referred':
        return referralSummary.submittedOn ? DateUtils.govukFormattedFullDateString(referralSummary.submittedOn) : 'N/A'
      case 'Earliest release date':
        return referralSummary.earliestReleaseDate
          ? DateUtils.govukFormattedFullDateString(referralSummary.earliestReleaseDate)
          : 'N/A'
      case 'Name / Prison number':
        return CaseListUtils.nameAndPrisonNumberHtml(referralSummary, paths)
      case 'Parole eligibility date':
        return referralSummary.sentence?.paroleEligibilityDate
          ? DateUtils.govukFormattedFullDateString(referralSummary.sentence.paroleEligibilityDate)
          : 'N/A'
      case 'Programme location':
        return referralSummary.prisonName || 'N/A'
      case 'Programme name':
        return referralSummary.courseName
      case 'Programme strand':
        return referralSummary.audience
      case 'Progress':
        return `${referralSummary.tasksCompleted || 0} out of 4 tasks complete`
      case 'Referral status':
        return CaseListUtils.statusTagHtml(referralSummary.status)
      case 'Release date type':
        return referralSummary.sentence?.nonDtoReleaseDateType
          ? {
              ARD: 'Automatic Release Date',
              CRD: 'Conditional Release Date',
              NPD: 'Non Parole Date',
              PRRD: 'Post Recall Release Date',
            }[referralSummary.sentence.nonDtoReleaseDateType]
          : 'N/A'
      case 'Tariff end date':
        return referralSummary.sentence?.tariffExpiryDate
          ? DateUtils.govukFormattedFullDateString(referralSummary.sentence.tariffExpiryDate)
          : 'N/A'
      default:
        return ''
    }
  }

  static tableRows(
    referralSummaries: Array<ReferralSummary>,
    columnsToInclude: Array<CaseListColumnHeader>,
    paths: typeof assessPaths | typeof referPaths = assessPaths,
  ): Array<GovukFrontendTableRow> {
    return referralSummaries.map(summary => {
      const row: GovukFrontendTableRow = []

      columnsToInclude.forEach(column => {
        switch (column) {
          case 'Conditional release date':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.conditionalReleaseDate },
              text: CaseListUtils.tableRowContent(summary, 'Conditional release date'),
            })
            break
          case 'Date referred':
            row.push({
              attributes: { 'data-sort-value': summary.submittedOn },
              text: CaseListUtils.tableRowContent(summary, 'Date referred'),
            })
            break
          case 'Earliest release date':
            row.push({
              attributes: { 'data-sort-value': summary.earliestReleaseDate },
              text: CaseListUtils.tableRowContent(summary, 'Earliest release date'),
            })
            break
          case 'Name / Prison number':
            row.push({
              attributes: { 'data-sort-value': CaseListUtils.formattedPrisonerName(summary.prisonerName) },
              html: CaseListUtils.tableRowContent(summary, 'Name / Prison number', paths),
            })
            break
          case 'Parole eligibility date':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.paroleEligibilityDate },
              text: CaseListUtils.tableRowContent(summary, 'Parole eligibility date'),
            })
            break
          case 'Programme location':
            row.push({
              attributes: { 'data-sort-value': summary.prisonName },
              text: CaseListUtils.tableRowContent(summary, 'Programme location'),
            })
            break
          case 'Programme name':
            row.push({ text: CaseListUtils.tableRowContent(summary, 'Programme name') })
            break
          case 'Programme strand':
            row.push({ text: CaseListUtils.tableRowContent(summary, 'Programme strand') })
            break
          case 'Progress':
            row.push({ text: CaseListUtils.tableRowContent(summary, 'Progress') })
            break
          case 'Referral status':
            row.push({
              attributes: { 'data-sort-value': summary.status },
              html: CaseListUtils.tableRowContent(summary, 'Referral status'),
            })
            break
          case 'Release date type':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.nonDtoReleaseDateType },
              text: CaseListUtils.tableRowContent(summary, 'Release date type'),
            })
            break
          case 'Tariff end date':
            row.push({
              attributes: { 'data-sort-value': summary.sentence?.tariffExpiryDate },
              text: CaseListUtils.tableRowContent(summary, 'Tariff end date'),
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

  private static nameAndPrisonNumberHtml(
    referralSummary: ReferralSummary,
    paths: typeof assessPaths | typeof referPaths,
  ): string {
    const path =
      referralSummary.status === 'referral_started'
        ? referPaths.new.show({ referralId: referralSummary.id })
        : paths.show.personalDetails({
            referralId: referralSummary.id,
          })
    const nameAndPrisonNumberHtmlStart = `<a class="govuk-link" href="${path}">`
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
