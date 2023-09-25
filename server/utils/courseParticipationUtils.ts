import DateUtils from './dateUtils'
import StringUtils from './stringUtils'
import type { CourseParticipationWithName } from '@accredited-programmes/models'
import type { GovukFrontendSummaryListRowWithValue } from '@accredited-programmes/ui'
import type { GovukFrontendSummaryList } from '@govuk-frontend'

export default class CourseParticipationUtils {
  static summaryListOptions(courseParticipationWithName: CourseParticipationWithName): GovukFrontendSummaryList {
    return {
      card: {
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
      let valueText = StringUtils.properCase(courseParticipationWithName.setting.type)

      if (courseParticipationWithName.setting.location) {
        valueText += `, ${courseParticipationWithName.setting.location}`
      }

      summaryListRows.push({
        key: { text: 'Setting' },
        value: { text: valueText },
      })
    }

    if (courseParticipationWithName.outcome) {
      let valueText = ''

      if (courseParticipationWithName.outcome.status) {
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
