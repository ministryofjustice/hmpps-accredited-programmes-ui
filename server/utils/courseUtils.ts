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

  static isBuildingChoices(displayName?: string): boolean {
    return displayName?.startsWith('Building Choices:') ?? false
  }

  static presentCourse(course: Course): CoursePresenter {
    return {
      ...course,
      audienceTag: CourseUtils.audienceTag(course),
      href: this.isBuildingChoices(course.displayName)
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
      /* eslint-disable sort-keys */
      Setting: 0,
      Gender: 1,
      'Risk criteria': 2,
      'Needs criteria': 3,
      'Learning needs': 4,
      'Suitable for people with learning disabilities or challenges (LDC)?': 5,
      'Equivalent non-LDC programme': 6,
      'Equivalent LDC programme': 7,
      'Time to complete': 8,
      /* eslint-enable sort-keys */
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
