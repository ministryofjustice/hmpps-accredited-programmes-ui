import { findPaths } from '../paths'
import type { Audience, CoursePrerequisite } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithKeyAndValue,
  GovukFrontendTagWithText,
  HasHtmlString,
} from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'
import type { GovukFrontendSelectItem } from '@govuk-frontend'

export default class CourseUtils {
  static audienceSelectItems(audiences: Array<Audience>): Array<GovukFrontendSelectItem> {
    return audiences.map(audience => {
      return {
        text: audience.name,
        value: audience.id,
      }
    })
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
      audienceTag: CourseUtils.audienceTag(course),
      href: course.displayName?.startsWith('Building Choices:')
        ? findPaths.buildingChoices.form.show({ courseId: course.id })
        : findPaths.show({ courseId: course.id }),
      prerequisiteSummaryListRows: CourseUtils.prerequisiteSummaryListRows(course.coursePrerequisites),
    }
  }

  private static audienceTag(course: Course): GovukFrontendTagWithText {
    return {
      attributes: { 'data-testid': 'audience-tag' },
      classes: `govuk-tag govuk-tag--${course.audienceColour} audience-tag`,
      text: course.audience,
    }
  }

  private static prerequisiteSummaryListRows(
    prerequisites: Array<CoursePrerequisite>,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    const order: Record<CoursePrerequisite['name'], number> = {
      'Equivalent LDC programme': 6,
      'Equivalent non-LDC programme': 5,
      Gender: 1,
      'Learning needs': 3,
      'Risk criteria': 2,
      Setting: 0,
      'Suitable for people with learning disabilities or challenges (LDC)?': 4,
      'Time to complete': 7,
    }

    const summaryListRows: Array<GovukFrontendSummaryListRowWithKeyAndValue> = []

    prerequisites.forEach(prerequisite => {
      const index = order[prerequisite.name]

      if (index === undefined) {
        return
      }

      if (summaryListRows[index]) {
        ;(summaryListRows[index].value as HasHtmlString).html += `<br>${prerequisite.description}`
      } else {
        summaryListRows[index] = {
          key: { text: prerequisite.name },
          value: { html: prerequisite.description },
        }
      }
    })

    return summaryListRows
  }
}
