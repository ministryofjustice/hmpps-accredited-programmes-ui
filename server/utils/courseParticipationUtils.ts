import type { Request } from 'express'

import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import { referPaths } from '../paths'
import type {
  CourseParticipation,
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
  CourseParticipationWithName,
  Referral,
} from '@accredited-programmes/models'
import type {
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

  static processDetailsFormData(request: RequestWithCourseParticipationDetailsBody): {
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
    return [
      CourseParticipationUtils.summaryListRow('Programme name', [courseParticipationWithName.name]),
      CourseParticipationUtils.summaryListRowSetting(courseParticipationWithName.setting),
      CourseParticipationUtils.summaryListRowOutcome(courseParticipationWithName.outcome),
      CourseParticipationUtils.summaryListRow('Additional detail', [courseParticipationWithName.detail]),
      CourseParticipationUtils.summaryListRow('Source of information', [courseParticipationWithName.source]),
      CourseParticipationUtils.summaryListRow('Added by', [
        courseParticipationWithName.addedBy,
        DateUtils.govukFormattedFullDateString(courseParticipationWithName.createdAt),
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
