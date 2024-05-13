import type { Request } from 'express'

import { referralStatusGroups } from '../../@types/models/Referral'
import { assessPaths, referPaths } from '../../paths'
import DateUtils from '../dateUtils'
import FormUtils from '../formUtils'
import StringUtils from '../stringUtils'
import type { Course, Referral, ReferralStatusRefData, ReferralView } from '@accredited-programmes/models'
import type { CaseListColumnHeader, MojFrontendNavigationItem, QueryParam } from '@accredited-programmes/ui'
import type { GovukFrontendSelectItem, GovukFrontendTableHeadElement, GovukFrontendTableRow } from '@govuk-frontend'

export default class CaseListUtils {
  static assessSubNavigationItems(
    currentPath: Request['path'],
    courseId: Course['id'],
  ): Array<MojFrontendNavigationItem> {
    return ['open', 'closed'].map(referralStatusGroup => {
      const path = assessPaths.caseList.show({ courseId, referralStatusGroup })

      return {
        active: currentPath === path,
        href: path,
        text: `${StringUtils.properCase(referralStatusGroup)} referrals`,
      }
    })
  }

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
      const path = assessPaths.caseList.show({
        courseId: course.id,
        referralStatusGroup: 'open',
      })

      return {
        active: currentPath === path,
        href: path,
        text: course.name,
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

  static referSubNavigationItems(currentPath: Request['path']): Array<MojFrontendNavigationItem> {
    return referralStatusGroups.map(referralStatusGroup => {
      const path = referPaths.caseList.show({ referralStatusGroup })

      return {
        active: currentPath === path,
        href: path,
        text: `${StringUtils.properCase(referralStatusGroup)} referrals`,
      }
    })
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

  static statusSelectItems(
    statuses: Array<ReferralStatusRefData>,
    selectedValue?: string,
  ): Array<GovukFrontendSelectItem> {
    return FormUtils.getSelectItems(
      Object.fromEntries(statuses.map(({ code, description }) => [code, description])),
      selectedValue,
    )
  }

  static statusTagHtml(
    statusColour?: Referral['statusColour'],
    statusDescription?: Referral['statusDescription'],
  ): string {
    return `<strong class="govuk-tag govuk-tag--${statusColour}">${statusDescription || 'Unknown status'}</strong>`
  }

  static tableRowContent(
    referralView: ReferralView,
    column: CaseListColumnHeader,
    paths: typeof assessPaths | typeof referPaths = assessPaths,
  ): string {
    switch (column) {
      case 'Conditional release date':
        return referralView.conditionalReleaseDate
          ? DateUtils.govukFormattedFullDateString(referralView.conditionalReleaseDate)
          : 'N/A'
      case 'Date referred':
        return referralView.submittedOn ? DateUtils.govukFormattedFullDateString(referralView.submittedOn) : 'N/A'
      case 'Earliest release date':
        return referralView.earliestReleaseDate
          ? DateUtils.govukFormattedFullDateString(referralView.earliestReleaseDate)
          : 'N/A'
      case 'Name / Prison number':
        return CaseListUtils.nameAndPrisonNumberHtml(referralView, paths)
      case 'Parole eligibility date':
        return referralView.paroleEligibilityDate
          ? DateUtils.govukFormattedFullDateString(referralView.paroleEligibilityDate)
          : 'N/A'
      case 'Programme location':
        return referralView.organisationName || 'N/A'
      case 'Programme name':
        return referralView.listDisplayName || 'N/A'
      case 'Programme strand':
        return referralView.audience || 'N/A'
      case 'Progress':
        return `${referralView.tasksCompleted || 0} out of 4 tasks complete`
      case 'Referral status':
        return CaseListUtils.statusTagHtml(referralView.statusColour, referralView.statusDescription)
      case 'Release date type':
        return referralView.nonDtoReleaseDateType
          ? {
              ARD: 'Automatic Release Date',
              CRD: 'Conditional Release Date',
              NPD: 'Non Parole Date',
              PRRD: 'Post Recall Release Date',
            }[referralView.nonDtoReleaseDateType]
          : 'N/A'
      case 'Sentence type':
        return CaseListUtils.sentenceTypeHtml(referralView, paths)
      case 'Tariff end date':
        return referralView.tariffExpiryDate
          ? DateUtils.govukFormattedFullDateString(referralView.tariffExpiryDate)
          : 'N/A'
      default:
        return ''
    }
  }

  static tableRows(
    referralViews: Array<ReferralView>,
    columnsToInclude: Array<CaseListColumnHeader>,
    paths: typeof assessPaths | typeof referPaths = assessPaths,
  ): Array<GovukFrontendTableRow> {
    return referralViews.map(view => {
      const row: GovukFrontendTableRow = []

      columnsToInclude.forEach(column => {
        switch (column) {
          case 'Conditional release date':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Conditional release date'),
            })
            break
          case 'Date referred':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Date referred'),
            })
            break
          case 'Earliest release date':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Earliest release date'),
            })
            break
          case 'Name / Prison number':
            row.push({
              html: CaseListUtils.tableRowContent(view, 'Name / Prison number', paths),
            })
            break
          case 'Parole eligibility date':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Parole eligibility date'),
            })
            break
          case 'Programme location':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Programme location'),
            })
            break
          case 'Programme name':
            row.push({ text: CaseListUtils.tableRowContent(view, 'Programme name') })
            break
          case 'Programme strand':
            row.push({ text: CaseListUtils.tableRowContent(view, 'Programme strand') })
            break
          case 'Progress':
            row.push({ text: CaseListUtils.tableRowContent(view, 'Progress') })
            break
          case 'Referral status':
            row.push({
              html: CaseListUtils.tableRowContent(view, 'Referral status'),
            })
            break
          case 'Release date type':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Release date type'),
            })
            break
          case 'Sentence type':
            row.push({
              html: CaseListUtils.tableRowContent(view, 'Sentence type'),
            })
            break
          case 'Tariff end date':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Tariff end date'),
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

  private static formattedPrisonerName(forename?: ReferralView['forename'], surname?: ReferralView['surname']): string {
    return StringUtils.convertToTitleCase([forename, surname].filter(nameComponent => nameComponent).join(' '))
  }

  private static nameAndPrisonNumberHtml(
    referralView: ReferralView,
    paths: typeof assessPaths | typeof referPaths,
  ): string {
    const isAssess = paths === assessPaths

    let path = paths.show.statusHistory({
      referralId: referralView.id,
    })

    if (isAssess) {
      path = assessPaths.show.personalDetails({
        referralId: referralView.id,
      })
    }

    if (referralView.status === 'referral_started') {
      path = referPaths.new.show({
        referralId: referralView.id,
      })
    }

    const nameAndPrisonNumberHtmlStart = `<a class="govuk-link" href="${path}?updatePerson=true">`
    const prisonerName = CaseListUtils.formattedPrisonerName(referralView?.forename, referralView?.surname)
    const nameAndPrisonNumberHtmlEnd = prisonerName
      ? `${prisonerName}</a><br>${referralView.prisonNumber}`
      : `${referralView.prisonNumber}</a>`

    return nameAndPrisonNumberHtmlStart + nameAndPrisonNumberHtmlEnd
  }

  private static selectItems(values: Array<string>, selectedValue?: string): Array<GovukFrontendSelectItem> {
    return FormUtils.getSelectItems(
      Object.fromEntries(values.map(value => [value.toLowerCase(), value])),
      selectedValue,
    )
  }

  private static sentenceTypeHtml(referralView: ReferralView, paths: typeof assessPaths | typeof referPaths): string {
    const { sentenceType } = referralView
    return sentenceType === 'Multiple sentences'
      ? `<a href="${paths.show.sentenceInformation({ referralId: referralView.id })}?updatePerson=true">${sentenceType}</a>`
      : sentenceType || 'N/A'
  }
}
