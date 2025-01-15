import type { Request } from 'express'

import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import { referPaths } from '../paths'
import type {
  CourseParticipationPresenter,
  GovukFrontendSummaryListCardActionsWithItems,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendSummaryListWithRowsWithKeysAndValues,
} from '@accredited-programmes/ui'
import type {
  CourseParticipation,
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
  Referral,
} from '@accredited-programmes-api'
import type {
  GovukFrontendSummaryListRowKey,
  GovukFrontendTable,
  GovukFrontendTableHeadElement,
  GovukFrontendTableRow,
} from '@govuk-frontend'

interface CourseParticipationDetailsBody {
  detail: string
  outcome: {
    yearCompleted: string
    yearStarted: string
    status?: CourseParticipationOutcome['status']
  }
  setting: {
    communityLocation: string
    custodyLocation: string
    type?: CourseParticipationSetting['type']
  }
  source: string
}

interface RequestWithCourseParticipationDetailsBody extends Request {
  body: CourseParticipationDetailsBody
}

export default class CourseParticipationUtils {
  static processCourseFormData(
    courseName: CourseParticipation['courseName'] | 'Other' | undefined,
    otherCourseName: CourseParticipation['courseName'] | undefined,
    request: Request,
  ): {
    hasFormErrors: boolean
    courseName?: CourseParticipation['courseName']
  } {
    let hasFormErrors = false
    const formattedOtherCourseName = otherCourseName?.trim()

    if (!courseName) {
      request.flash('courseNameError', 'Select a programme')

      hasFormErrors = true
    }

    if (courseName === 'Other' && !formattedOtherCourseName) {
      request.flash('otherCourseNameError', 'Enter the programme name')

      hasFormErrors = true
    }

    return {
      courseName: courseName === 'Other' ? formattedOtherCourseName : courseName,
      hasFormErrors,
    }
  }

  static processDetailsFormData(
    request: RequestWithCourseParticipationDetailsBody,
    courseName: CourseParticipation['courseName'],
  ): {
    courseParticipationUpdate: CourseParticipationUpdate
    hasFormErrors: boolean
  } {
    const { detail, outcome, setting, source } = request.body

    let hasFormErrors = false
    let processedOutcome: CourseParticipationOutcome | undefined

    if (outcome.status) {
      const field = outcome.status === 'complete' ? 'yearCompleted' : 'yearStarted'
      const { hasError, value } = this.validateYear(field, outcome[field], request)

      if (hasError) {
        hasFormErrors = true
      }

      processedOutcome = { [field]: value, status: outcome.status }
    }

    const courseParticipationUpdate: CourseParticipationUpdate = {
      courseName,
      detail: detail?.trim() || undefined,
      outcome: processedOutcome,
      setting: setting.type
        ? {
            location: (setting.type === 'community' ? setting.communityLocation : setting.custodyLocation) || undefined,
            type: setting.type,
          }
        : undefined,
      source: source.trim() || undefined,
    }

    return {
      courseParticipationUpdate,
      hasFormErrors,
    }
  }

  static summaryListOptions(
    courseParticipation: CourseParticipationPresenter,
    referralId: Referral['id'],
    headingLevel?: number,
    withActions = { change: true, remove: true },
  ): GovukFrontendSummaryListWithRowsWithKeysAndValues {
    const actions: GovukFrontendSummaryListCardActionsWithItems = { items: [] }

    if (withActions.change) {
      actions.items.push({
        href: referPaths.new.programmeHistory.editProgramme({
          courseParticipationId: courseParticipation.id,
          referralId,
        }),
        text: 'Change',
        visuallyHiddenText: 'programme',
      })
    }

    if (withActions.remove) {
      actions.items.push({
        href: referPaths.new.programmeHistory.delete({
          courseParticipationId: courseParticipation.id,
          referralId,
        }),
        text: 'Remove',
        visuallyHiddenText: 'programme',
      })
    }

    return {
      card: {
        actions,
        title: {
          headingLevel,
          text: courseParticipation.courseName,
        },
      },
      rows: CourseParticipationUtils.summaryListRows(courseParticipation),
    }
  }

  static table(
    courseParticipations: Array<CourseParticipation>,
    referralId: Referral['id'],
    testId: string,
    editable = false,
  ): GovukFrontendTable {
    const head: Array<GovukFrontendTableHeadElement> = [
      {
        attributes: { 'aria-sort': 'ascending' },
        text: 'Programme',
      },
      {
        attributes: { 'aria-sort': 'none' },
        text: 'Location',
      },
      {
        attributes: { 'aria-sort': 'none' },
        text: 'Outcome',
      },
      { text: 'Notes' },
      ...(editable ? [{ text: 'Action' }] : []),
    ]

    const rows: Array<GovukFrontendTableRow> = courseParticipations
      .sort((a, b) => (a.courseName ?? '').localeCompare(b.courseName ?? ''))
      .map(courseParticipation => {
        return [
          {
            attributes: {
              'data-sort-value': courseParticipation.courseName,
            },
            html: `<a href="${referPaths.new.programmeHistory.show({ courseParticipationId: courseParticipation.id, referralId })}">${courseParticipation.courseName}</a>`,
          },
          { text: this.textValue(courseParticipation.setting?.location) },
          { text: this.textValue(this.outcomeString(courseParticipation.outcome)) },
          { text: courseParticipation.detail },
          ...(editable
            ? [
                {
                  html: `<ul class="govuk-summary-list__actions-list">
                        <li class="govuk-summary-list__actions-list-item">
                          <a class="govuk-link" href="${referPaths.new.programmeHistory.editProgramme({ courseParticipationId: courseParticipation.id, referralId })}">Change<span class="govuk-visually-hidden"> programme (${courseParticipation.courseName})</span></a>
                        </li>
                        <li class="govuk-summary-list__actions-list-item">
                          <a class="govuk-link" href="${referPaths.new.programmeHistory.delete({ courseParticipationId: courseParticipation.id, referralId })}">Remove<span class="govuk-visually-hidden"> programme (${courseParticipation.courseName})</span></a>
                        </li>
                      </ul>`,
                },
              ]
            : []),
        ]
      })

    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': testId,
      },
      head,
      rows,
    }
  }

  private static outcomeString(outcome?: CourseParticipationOutcome) {
    if (outcome?.yearStarted) {
      return `Deselected ${outcome.yearStarted}`
    }

    if (outcome?.yearCompleted) {
      return `Completed ${outcome.yearCompleted}`
    }

    return undefined
  }

  private static summaryListRows(
    courseParticipation: CourseParticipationPresenter,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      CourseParticipationUtils.summaryListRow('Programme name', [courseParticipation.courseName]),
      CourseParticipationUtils.summaryListRowSetting(courseParticipation.setting),
      CourseParticipationUtils.summaryListRowOutcome(courseParticipation.outcome),
      CourseParticipationUtils.summaryListRow('Additional detail', [courseParticipation.detail]),
      CourseParticipationUtils.summaryListRow('Source of information', [courseParticipation.source]),
      CourseParticipationUtils.summaryListRow('Added by', [
        courseParticipation.addedByDisplayName,
        DateUtils.govukFormattedFullDateString(courseParticipation.createdAt),
      ]),
    ]
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static summaryListRow(
    keyText: GovukFrontendSummaryListRowKey['text'],
    valueTextItems: Array<string | undefined>,
  ): GovukFrontendSummaryListRowWithKeyAndValue {
    const valueTextItemsWithoutBlanks = valueTextItems.filter(Boolean)

    return {
      key: { text: keyText },
      value: { text: this.textValue(valueTextItemsWithoutBlanks.join(', ')) },
    }
  }

  private static summaryListRowOutcome(
    outcome?: CourseParticipationOutcome,
  ): GovukFrontendSummaryListRowWithKeyAndValue {
    const valueTextItems: Array<string> = []

    if (outcome?.status) {
      valueTextItems.push(StringUtils.properCase(outcome.status))
    }

    if (outcome?.yearStarted) {
      valueTextItems.push(`Year started ${outcome.yearStarted}`)
    }

    if (outcome?.yearCompleted) {
      valueTextItems.push(`Year complete ${outcome.yearCompleted}`)
    }

    return this.summaryListRow('Outcome', valueTextItems)
  }

  private static summaryListRowSetting(
    setting?: CourseParticipationSetting,
  ): GovukFrontendSummaryListRowWithKeyAndValue {
    const valueTextItems: Array<string> = []

    if (setting?.type) {
      valueTextItems.push(StringUtils.properCase(setting.type))
    }

    if (setting?.location) {
      valueTextItems.push(`${setting.location}`)
    }

    return this.summaryListRow('Setting', valueTextItems)
  }

  private static textValue(value?: string): string {
    return value || 'Not known'
  }

  private static validateYear(
    field: string,
    value: string,
    request: Request,
  ): { hasError: boolean; value: number | undefined } {
    let hasError = false

    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return { hasError, value: undefined }
    }

    const numericValue = Number(trimmedValue)

    if (trimmedValue) {
      if (Number.isNaN(numericValue)) {
        request.flash(`${field}Error`, 'Enter a year using numbers only')
        hasError = true
      } else if (trimmedValue.length !== 4) {
        request.flash(`${field}Error`, 'Enter a year using 4 digits only. For example, 1994')
        hasError = true
      } else if (numericValue < 1990 || numericValue > new Date().getFullYear()) {
        request.flash(`${field}Error`, `Enter a year between 1990 and ${new Date().getFullYear()}`)
        hasError = true
      }
    }

    if (hasError) {
      request.flash('formValues', JSON.stringify(request.body))
      return { hasError, value: undefined }
    }

    return { hasError, value: numericValue }
  }
}

export type { CourseParticipationDetailsBody, RequestWithCourseParticipationDetailsBody }
