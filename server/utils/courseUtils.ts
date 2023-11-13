import type { Course, CourseAudience, CoursePrerequisite } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendTagWithText,
  HasTextString,
  TagColour,
} from '@accredited-programmes/ui'

export default class CourseUtils {
  static courseRadioOptions(courseNames: Array<Course['name']>): Array<GovukFrontendTagWithText> {
    return courseNames.map(courseName => {
      return {
        text: courseName,
        value: courseName,
      }
    })
  }

  static presentCourse(course: Course): CoursePresenter {
    const nameAndAlternateName = course.alternateName ? `${course.name} (${course.alternateName})` : course.name

    return {
      ...course,
      audienceTags: CourseUtils.audienceTags(course.audiences),
      nameAndAlternateName,
      prerequisiteSummaryListRows: CourseUtils.prerequisiteSummaryListRows(course.coursePrerequisites),
    }
  }

  private static audienceTags(audiences: Array<CourseAudience>): Array<GovukFrontendTagWithText> {
    const audienceColourMap: Record<CourseAudience['value'], TagColour> = {
      'Extremism offence': 'turquoise',
      'Gang offence': 'purple',
      'General offence': 'pink',
      'General violence offence': 'yellow',
      'Intimate partner violence offence': 'green',
      'Sexual offence': 'orange',
    }

    return audiences.map(audience => {
      const colour: TagColour = audienceColourMap[audience.value]

      return {
        classes: `govuk-tag govuk-tag--${colour}`,
        text: audience.value,
      }
    })
  }

  private static prerequisiteSummaryListRows(
    prerequisites: Array<CoursePrerequisite>,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const order: Record<CoursePrerequisite['name'], number> = {
      Gender: 1,
      'Learning needs': 3,
      'Risk criteria': 2,
      Setting: 0,
    }

    const summaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = []

    prerequisites.forEach(prerequisite => {
      const index = order[prerequisite.name]

      if (index === undefined) {
        return
      }

      if (summaryListRows[index]) {
        ;(summaryListRows[index].value as HasTextString).text += `, ${prerequisite.description}`
      } else {
        summaryListRows[index] = {
          key: { text: prerequisite.name },
          value: { text: prerequisite.description },
        }
      }
    })

    return summaryListRows
  }
}
