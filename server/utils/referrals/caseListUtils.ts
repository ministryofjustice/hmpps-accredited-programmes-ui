import type { Request } from 'express'

import { referralStatusGroups } from '../../@types/models/Referral'
import { assessPaths, referPaths } from '../../paths'
import DateUtils from '../dateUtils'
import FormUtils from '../formUtils'
import PathUtils from '../pathUtils'
import StringUtils from '../stringUtils'
import type { ReferralStatusGroup, ReferralStatusRefData, ReferralView } from '@accredited-programmes/models'
import type { CaseListColumnHeader, MojFrontendNavigationItem, QueryParam } from '@accredited-programmes/ui'
import type { Audience, Course, Referral } from '@accredited-programmes-api'
import type { GovukFrontendSelectItem, GovukFrontendTableHeadElement, GovukFrontendTableRow } from '@govuk-frontend'

export default class CaseListUtils {
  static assessSubNavigationItems(
    currentPath: Request['path'],
    courseId: Course['id'],
    counts: Partial<Record<ReferralStatusGroup, number>>,
    queryParams: Array<QueryParam> = [],
  ): Array<MojFrontendNavigationItem> {
    const statusGroups: Array<ReferralStatusGroup> = ['open', 'closed']
    return statusGroups.map(referralStatusGroup => {
      const path = assessPaths.caseList.show({ courseId, referralStatusGroup })

      return {
        active: currentPath === path,
        href: PathUtils.pathWithQuery(path, queryParams),
        text: `${StringUtils.properCase(referralStatusGroup)} referrals (${counts[referralStatusGroup]})`,
      }
    })
  }

  static audienceSelectItems(audiences: Array<Audience>, selectedValue?: string): Array<GovukFrontendSelectItem> {
    return this.selectItems(
      audiences.map(audience => audience.name).filter(audience => audience !== undefined),
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
    nameOrId?: string,
    isLdc?: boolean 
  ): Array<QueryParam> {
    const queryParams: Array<QueryParam> = []

    if (audience) {
      queryParams.push({ key: 'strand', value: audience })
    }

    if (nameOrId) {
      queryParams.push({ key: 'nameOrId', value: nameOrId })
    }

    if (status) {
      queryParams.push({ key: 'status', value: status })
    }

    if (sortColumn && sortDirection) {
      queryParams.push({ key: 'sortColumn', value: sortColumn })
      queryParams.push({ key: 'sortDirection', value: sortDirection })
    }

    if(isLdc) {
      queryParams.push({ key: 'isLdc', value: isLdc.toString() })
    }

    return queryParams
  }

  static queryParamsExcludingSort(
    audience?: string,
    status?: string,
    page?: string,
    nameOrId?: string,
  ): Array<QueryParam> {
    const queryParams: Array<QueryParam> = []

    if (audience) {
      queryParams.push({ key: 'strand', value: audience })
    }

    if (nameOrId) {
      queryParams.push({ key: 'nameOrId', value: nameOrId })
    }

    if (status) {
      queryParams.push({ key: 'status', value: status })
    }

    if (page) {
      queryParams.push({ key: 'page', value: page })
    }

    return queryParams
  }

  static referSubNavigationItems(
    currentPath: Request['path'],
    counts: Record<ReferralStatusGroup, number>,
    queryParams: Array<QueryParam> = [],
  ): Array<MojFrontendNavigationItem> {
    return referralStatusGroups.map(referralStatusGroup => {
      const path = referPaths.caseList.show({ referralStatusGroup })

      return {
        active: currentPath === path,
        href: PathUtils.pathWithQuery(path, queryParams),
        text: `${StringUtils.properCase(referralStatusGroup)} referrals (${counts[referralStatusGroup]})`,
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
    hidePlaceholder?: boolean,
  ): Array<GovukFrontendSelectItem> {
    return FormUtils.getSelectItems(
      Object.fromEntries(statuses.map(({ code, description }) => [code, description])),
      selectedValue,
      hidePlaceholder,
    )
  }

  static statusTagHtml(statusColour?: string, statusDescription?: Referral['statusDescription']): string {
    return `<strong class="govuk-tag govuk-tag--${statusColour}">${statusDescription || 'Unknown status'}</strong>`
  }

  static tableRowContent(
    referralView: ReferralView,
    column: CaseListColumnHeader,
    paths: typeof assessPaths | typeof referPaths = assessPaths,
  ): string {
    switch (column) {
      case 'Date referred':
        return referralView.submittedOn ? DateUtils.govukFormattedFullDateString(referralView.submittedOn) : 'N/A'
      case 'Earliest release date':
        return referralView.earliestReleaseDate
          ? `${DateUtils.govukFormattedFullDateString(referralView.earliestReleaseDate)}<br>${referralView.earliestReleaseDateType}`
          : 'N/A'
      case 'Location':
        return referralView.location || 'N/A'
      case 'Name and prison number':
        return CaseListUtils.nameAndPrisonNumberHtml(referralView, paths)
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
      case 'Sentence type':
        return CaseListUtils.sentenceTypeHtml(referralView)
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
          case 'Date referred':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Date referred'),
            })
            break
          case 'Earliest release date':
            row.push({
              html: CaseListUtils.tableRowContent(view, 'Earliest release date'),
            })
            break
          case 'Location':
            row.push({
              text: CaseListUtils.tableRowContent(view, 'Location'),
            })
            break
          case 'Name and prison number':
            row.push({
              html: CaseListUtils.tableRowContent(view, 'Name and prison number', paths),
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
          case 'Sentence type':
            row.push({
              html: CaseListUtils.tableRowContent(view, 'Sentence type'),
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
    return StringUtils.convertToTitleCase([surname, forename].filter(nameComponent => nameComponent).join(', '))
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

  private static sentenceTypeHtml(referralView: ReferralView): string {
    const { sentenceType } = referralView

    if (!sentenceType) {
      return 'N/A'
    }

    if (sentenceType.includes('Recall')) {
      return sentenceType.replace(/(and )?Recall/, '<span class="moj-badge">Recall</span>')
    }

    return sentenceType
  }
}
