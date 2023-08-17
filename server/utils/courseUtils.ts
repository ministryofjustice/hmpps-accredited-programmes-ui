import type { Course, CourseAudience, CoursePrerequisite } from '@accredited-programmes/models'
import type {
  CoursePresenter,
  GovukFrontendSummaryListRowWithValue,
  HasTextString,
  TagColour,
} from '@accredited-programmes/ui'
import type { GovukFrontendTag } from '@govuk-frontend'

const audienceTags = (audiences: Array<CourseAudience>): Array<GovukFrontendTag> => {
  const audienceColourMap: { [key: CourseAudience['value']]: TagColour } = {
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

const prerequisiteSummaryListRows = (
  prerequisites: Array<CoursePrerequisite>,
): Array<GovukFrontendSummaryListRowWithValue> => {
  const order: { [key: CoursePrerequisite['name']]: number } = {
    Gender: 1,
    'Learning needs': 3,
    'Risk criteria': 2,
    Setting: 0,
  }

  const summaryListRows: Array<GovukFrontendSummaryListRowWithValue> = []

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

const presentCourse = (course: Course): CoursePresenter => {
  const nameAndAlternateName = course.alternateName ? `${course.name} (${course.alternateName})` : course.name

  return {
    ...course,
    audienceTags: audienceTags(course.audiences),
    nameAndAlternateName,
    prerequisiteSummaryListRows: prerequisiteSummaryListRows(course.coursePrerequisites),
  }
}

export default { presentCourse }
