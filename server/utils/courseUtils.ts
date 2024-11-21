import { findPaths } from '../paths'
import type { Audience, CoursePrerequisite } from '@accredited-programmes/models'
import type {
  BuildingChoicesSearchForm,
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

  static buildingChoicesAnswersSummaryListRows(
    formData: BuildingChoicesSearchForm,
  ): Array<GovukFrontendSummaryListRowWithKeyAndValue> {
    return [
      {
        key: {
          classes: 'govuk-!-width-one-third',
          text: 'Convicted of a sexual offence',
        },
        value: { text: formData.isConvictedOfSexualOffence === 'true' ? 'Yes' : 'No' },
      },
      {
        key: {
          classes: 'govuk-!-width-one-third',
          text: 'In a women’s prison',
        },
        value: { text: formData.isInAWomensPrison === 'true' ? 'Yes' : 'No' },
      },
    ]
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
      prerequisiteSummaryListRows: this.prerequisiteSummaryListRows(course.coursePrerequisites),
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

    const prerequisitesCopy = [...prerequisites]
    prerequisitesCopy
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(prerequisite => {
        const index = order[prerequisite.name]

        if (prerequisite.name === 'Risk criteria pre' || prerequisite.name === 'Risk criteria post') {
          const riskCriteriaItems = summaryListRows[order['Risk criteria']]

          if (riskCriteriaItems) {
            const { description } = prerequisite
            const existingHtml = riskCriteriaItems.value.html

            riskCriteriaItems.value.html =
              prerequisite.name === 'Risk criteria pre'
                ? `${description}<br><br>${existingHtml}`
                : `${existingHtml}<br><br>${description}`
          }

          return
        }

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
