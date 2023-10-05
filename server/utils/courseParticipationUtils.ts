import type { Request } from 'express'

import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import { referPaths } from '../paths'
import type { CourseParticipation, CourseParticipationWithName, Referral } from '@accredited-programmes/models'
import type {
  GovukFrontendSummaryListRowWithValue,
  GovukFrontendSummaryListWithRowsWithValues,
} from '@accredited-programmes/ui'

export default class CourseParticipationUtils {
  static processedCourseFormData(
    courseId: CourseParticipation['courseId'] | 'other' | undefined,
    otherCourseName: CourseParticipation['otherCourseName'] | undefined,
    request: Request,
  ): {
    hasFormErrors: boolean
    courseId?: CourseParticipation['courseId']
    otherCourseName?: CourseParticipation['otherCourseName']
  } {
    let hasFormErrors = false
    const formattedOtherCourseName = otherCourseName?.trim()

    if (!courseId) {
      request.flash('courseIdError', 'Select a programme')

      hasFormErrors = true
    }

    if (courseId === 'other' && !formattedOtherCourseName) {
      request.flash('otherCourseNameError', 'Enter the programme name')

      hasFormErrors = true
    }

    return {
      courseId: courseId === 'other' ? undefined : courseId,
      hasFormErrors,
      otherCourseName: courseId === 'other' ? formattedOtherCourseName : undefined,
    }
  }

  static summaryListOptions(
    courseParticipationWithName: CourseParticipationWithName,
    referralId: Referral['id'],
    withActions = true,
  ): GovukFrontendSummaryListWithRowsWithValues {
    const actions = withActions
      ? {
          items: [
            {
              href: referPaths.programmeHistory.editProgramme({
                courseParticipationId: courseParticipationWithName.id,
                referralId,
              }),
              text: 'Change',
              visuallyHiddenText: `participation for ${courseParticipationWithName.name}`,
            },
            {
              href: referPaths.programmeHistory.delete({
                courseParticipationId: courseParticipationWithName.id,
                referralId,
              }),
              text: 'Remove',
              visuallyHiddenText: `participation for ${courseParticipationWithName.name}`,
            },
          ],
        }
      : undefined

    return {
      card: {
        actions,
        title: {
          text: courseParticipationWithName.name,
        },
      },
      rows: CourseParticipationUtils.summaryListRows(courseParticipationWithName),
    }
  }

  private static summaryListRows(
    courseParticipationWithName: CourseParticipationWithName,
  ): Array<GovukFrontendSummaryListRowWithValue> {
    const summaryListRows: Array<GovukFrontendSummaryListRowWithValue> = []

    summaryListRows.push({
      key: { text: 'Programme name' },
      value: { text: courseParticipationWithName.name },
    })

    summaryListRows.push(CourseParticipationUtils.settingSummaryListRow(courseParticipationWithName))
    summaryListRows.push(CourseParticipationUtils.outcomeSummaryListRow(courseParticipationWithName))
    summaryListRows.push(CourseParticipationUtils.outcomeAdditionalDetailSummaryListRow(courseParticipationWithName))
    summaryListRows.push(CourseParticipationUtils.sourceSummaryListRow(courseParticipationWithName))
    summaryListRows.push(CourseParticipationUtils.addedBySummaryListRow(courseParticipationWithName))

    return summaryListRows
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static settingSummaryListRow(
    courseParticipationWithName: CourseParticipationWithName,
  ): GovukFrontendSummaryListRowWithValue {
    const valueTextItems: Array<string> = []

    if (courseParticipationWithName.setting.type) {
      valueTextItems.push(StringUtils.properCase(courseParticipationWithName.setting.type))
    }

    if (courseParticipationWithName.setting.location) {
      valueTextItems.push(`${courseParticipationWithName.setting.location}`)
    }

    return {
      key: { text: 'Setting' },
      value: { text: valueTextItems.join(', ') || 'Not known' },
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static outcomeSummaryListRow(
    courseParticipationWithName: CourseParticipationWithName,
  ): GovukFrontendSummaryListRowWithValue {
    const valueTextItems: Array<string> = []

    if (courseParticipationWithName.outcome?.status) {
      valueTextItems.push(StringUtils.properCase(courseParticipationWithName.outcome.status))
    }

    if (courseParticipationWithName.outcome?.yearStarted) {
      valueTextItems.push(`year started ${courseParticipationWithName.outcome.yearStarted}`)
    }

    if (courseParticipationWithName.outcome?.yearCompleted) {
      valueTextItems.push(`year completed ${courseParticipationWithName.outcome.yearCompleted}`)
    }

    return {
      key: { text: 'Outcome' },
      value: { text: valueTextItems.join(', ') || 'Not known' },
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static outcomeAdditionalDetailSummaryListRow(
    courseParticipationWithName: CourseParticipationWithName,
  ): GovukFrontendSummaryListRowWithValue {
    return {
      key: { text: 'Additional detail' },
      value: { text: courseParticipationWithName.outcome.detail || 'Not known' },
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static sourceSummaryListRow(
    courseParticipationWithName: CourseParticipationWithName,
  ): GovukFrontendSummaryListRowWithValue {
    return {
      key: { text: 'Source of information' },
      value: { text: courseParticipationWithName.source || 'Not known' },
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static addedBySummaryListRow(
    courseParticipationWithName: CourseParticipationWithName,
  ): GovukFrontendSummaryListRowWithValue {
    const addedByValueText = [
      courseParticipationWithName.addedBy,
      DateUtils.govukFormattedFullDateString(courseParticipationWithName.createdAt),
    ].join(', ')

    return {
      key: { text: 'Added by' },
      value: { text: addedByValueText },
    }
  }
}
