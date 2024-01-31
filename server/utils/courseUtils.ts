import type { Course, CoursePrerequisite } from '@accredited-programmes/api'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendTagWithText,
  HasTextString,
  TagColour,
} from '@accredited-programmes/ui'

export default class CourseUtils {
  static courseNameWithAlternateName(course: Course): string {
    return course.alternateName ? `${course.name} (${course.alternateName})` : course.name
  }

  static courseRadioOptions(courseNames: Array<Course['name']>): Array<GovukFrontendTagWithText> {
    return courseNames.map(courseName => {
      return {
        text: courseName,
        value: courseName,
      }
    })
  }

  static presentCourse(course: Course): CoursePresenter {
    return {
      ...course,
      audienceTag: CourseUtils.audienceTag(course.audience),
      nameAndAlternateName: CourseUtils.courseNameWithAlternateName(course),
      prerequisiteSummaryListRows: CourseUtils.prerequisiteSummaryListRows(course.coursePrerequisites),
    }
  }

  private static audienceTag(audience: Course['audience']): GovukFrontendTagWithText {
    const audienceColourMap: Record<Course['audience'], TagColour> = {
      'Extremism offence': 'turquoise',
      'Gang offence': 'purple',
      'General offence': 'pink',
      'General violence offence': 'yellow',
      'Intimate partner violence offence': 'green',
      'Sexual offence': 'orange',
    }

    const colour: TagColour = audienceColourMap[audience]

    return {
      attributes: { 'data-testid': 'audience-tag' },
      classes: `govuk-tag govuk-tag--${colour} audience-tag`,
      text: audience,
    }
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
