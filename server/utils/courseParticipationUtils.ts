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

interface DetailsBody {
  outcome: {
    detail: string
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
interface RequestWithDetailsBody extends Request {
  body: DetailsBody
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

  static processDetailsFormData(request: RequestWithDetailsBody): {
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

    const { outcome, setting, source } = body

    const courseParticipationUpdate: CourseParticipationUpdate = {
      outcome: {
        detail: outcome.detail?.trim() || undefined,
        status: outcome.status,
        yearCompleted: outcome.status === 'complete' ? validateYear('yearCompleted', outcome.yearCompleted) : undefined,
        yearStarted: outcome.status === 'incomplete' ? validateYear('yearStarted', outcome.yearStarted) : undefined,
      },
      setting: {
        location: (setting.type === 'community' ? setting.communityLocation : setting.custodyLocation) || undefined,
        type: setting.type,
      },
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
    const summaryListRows: Array<GovukFrontendSummaryListRowWithValue> = []

    summaryListRows.push({
      key: { text: 'Programme name' },
      value: { text: courseParticipationWithName.name },
    })

    if (courseParticipationWithName.setting) {
      const valueTextItems: Array<string> = []

      if (courseParticipationWithName.setting.type) {
        valueTextItems.push(StringUtils.properCase(courseParticipationWithName.setting.type))
      }

      if (courseParticipationWithName.setting.location) {
        valueTextItems.push(`${courseParticipationWithName.setting.location}`)
      }

      const valueText = valueTextItems.join(', ')

      if (valueText) {
        summaryListRows.push({
          key: { text: 'Setting' },
          value: { text: valueText },
        })
      }
    }

    if (courseParticipationWithName.outcome) {
      if (courseParticipationWithName.outcome.status) {
        let valueText = ''

        valueText += StringUtils.properCase(courseParticipationWithName.outcome.status)

        if (courseParticipationWithName.outcome.yearStarted) {
          valueText += ` - started ${courseParticipationWithName.outcome.yearStarted}`
        }

        if (courseParticipationWithName.outcome.yearCompleted) {
          valueText += ` - completed in ${courseParticipationWithName.outcome.yearCompleted}`
        }

        summaryListRows.push({
          key: { text: 'Outcome' },
          value: { text: valueText },
        })
      }

      if (courseParticipationWithName.outcome.detail) {
        summaryListRows.push({
          key: { text: 'Additional detail' },
          value: { text: courseParticipationWithName.outcome.detail },
        })
      }
    }

    if (courseParticipationWithName.source) {
      summaryListRows.push({
        key: { text: 'Source of information' },
        value: { text: courseParticipationWithName.source },
      })
    }

    const addedByValueText = [
      courseParticipationWithName.addedBy,
      DateUtils.govukFormattedFullDateString(courseParticipationWithName.createdAt),
    ].join(', ')

    summaryListRows.push({
      key: { text: 'Added by' },
      value: { text: addedByValueText },
    })

    return summaryListRows
  }
}

export type { DetailsBody, RequestWithDetailsBody }
