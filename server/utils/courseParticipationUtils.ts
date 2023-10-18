import type { Request } from 'express'

import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import { referPaths } from '../paths'
import type {
  CourseParticipation,
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
  Referral,
} from '@accredited-programmes/models'
import type {
  GovukFrontendSummaryListCardActionsWithItems,
  GovukFrontendSummaryListRowWithValue,
  GovukFrontendSummaryListWithRowsWithValues,
} from '@accredited-programmes/ui'
import type { GovukFrontendSummaryListRowKey } from '@govuk-frontend'

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
    const { body } = request
    let hasFormErrors = false

    const validateYear = (field: string, value: string): number | undefined => {
      const validatedYear = value ? Number(value) : undefined

      if (value && Number.isNaN(validatedYear)) {
        request.flash(`${field}Error`, 'Enter a year using numbers only')
        request.flash('formValues', JSON.stringify(body))

        hasFormErrors = true

        return undefined
      }

      return validatedYear
    }

    const { detail, outcome, setting, source } = body

    const courseParticipationUpdate: CourseParticipationUpdate = {
      courseName,
      detail: detail?.trim() || undefined,
      outcome: outcome.status
        ? {
            status: outcome.status,
            yearCompleted:
              outcome.status === 'complete' ? validateYear('yearCompleted', outcome.yearCompleted) : undefined,
            yearStarted: outcome.status === 'incomplete' ? validateYear('yearStarted', outcome.yearStarted) : undefined,
          }
        : undefined,
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
    courseParticipation: CourseParticipation,
    referralId: Referral['id'],
    withActions = { change: true, remove: true },
  ): GovukFrontendSummaryListWithRowsWithValues {
    const actions: GovukFrontendSummaryListCardActionsWithItems = { items: [] }

    if (withActions.change) {
      actions.items.push({
        href: referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipation.id,
          referralId,
        }),
        text: 'Change',
        visuallyHiddenText: `participation for ${courseParticipation.courseName}`,
      })
    }

    if (withActions.remove) {
      actions.items.push({
        href: referPaths.programmeHistory.delete({
          courseParticipationId: courseParticipation.id,
          referralId,
        }),
        text: 'Remove',
        visuallyHiddenText: `participation for ${courseParticipation.courseName}`,
      })
    }

    return {
      card: {
        actions,
        title: {
          text: courseParticipation.courseName,
        },
      },
      rows: CourseParticipationUtils.summaryListRows(courseParticipation),
    }
  }

  private static summaryListRows(
    courseParticipation: CourseParticipation,
  ): Array<GovukFrontendSummaryListRowWithValue> {
    return [
      CourseParticipationUtils.summaryListRow('Programme name', [courseParticipation.courseName]),
      CourseParticipationUtils.summaryListRowSetting(courseParticipation.setting),
      CourseParticipationUtils.summaryListRowOutcome(courseParticipation.outcome),
      CourseParticipationUtils.summaryListRow('Additional detail', [courseParticipation.detail]),
      CourseParticipationUtils.summaryListRow('Source of information', [courseParticipation.source]),
      CourseParticipationUtils.summaryListRow('Added by', [
        courseParticipation.addedBy,
        DateUtils.govukFormattedFullDateString(courseParticipation.createdAt),
      ]),
    ]
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static summaryListRow(
    keyText: GovukFrontendSummaryListRowKey['text'],
    valueTextItems: Array<string | undefined>,
  ): GovukFrontendSummaryListRowWithValue {
    const valueTextItemsWithoutBlanks = valueTextItems.filter(Boolean)

    return {
      key: { text: keyText },
      value: { text: valueTextItemsWithoutBlanks.join(', ') || 'Not known' },
    }
  }

  private static summaryListRowOutcome(outcome?: CourseParticipationOutcome): GovukFrontendSummaryListRowWithValue {
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

  private static summaryListRowSetting(setting?: CourseParticipationSetting): GovukFrontendSummaryListRowWithValue {
    const valueTextItems: Array<string> = []

    if (setting?.type) {
      valueTextItems.push(StringUtils.properCase(setting.type))
    }

    if (setting?.location) {
      valueTextItems.push(`${setting.location}`)
    }

    return this.summaryListRow('Setting', valueTextItems)
  }
}

export type { CourseParticipationDetailsBody, RequestWithCourseParticipationDetailsBody }
