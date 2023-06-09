import type { Course, CourseAudience, CoursePrerequisite } from '@accredited-programmes/models'
import type { CoursePresenter, ObjectWithTextString, SummaryListRow, Tag, TagColour } from '@accredited-programmes/ui'

const audienceTags = (audiences: Array<CourseAudience>): Array<Tag> => {
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
      text: audience.value,
      classes: `govuk-tag govuk-tag--${colour}`,
    }
  })
}

const prerequisiteSummaryListRows = (prerequisites: Array<CoursePrerequisite>): Array<SummaryListRow> => {
  const order: { [key: CoursePrerequisite['name']]: number } = {
    Setting: 0,
    Gender: 1,
    'Risk criteria': 2,
    'Learning needs': 3,
  }

  const summaryListRows: Array<SummaryListRow> = []

  prerequisites.forEach(prerequisite => {
    const index = order[prerequisite.name]

    if (index === undefined) {
      return
    }

    if (summaryListRows[index]) {
      ;(summaryListRows[index].value as ObjectWithTextString).text += `, ${prerequisite.description}`
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
    nameAndAlternateName,
    audienceTags: audienceTags(course.audiences),
    prerequisiteSummaryListRows: prerequisiteSummaryListRows(course.coursePrerequisites),
  }
}

export default presentCourse
