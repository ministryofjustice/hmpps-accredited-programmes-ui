import type { Course } from './Course'
import type { Person } from './Person'

type CourseParticipationOutcomeStatus = 'complete' | 'incomplete'

type CourseParticipationOutcome = {
  detail?: string
  status?: CourseParticipationOutcomeStatus
  yearCompleted?: number
  yearStarted?: number
}

type CourseParticipationSetting = {
  type: 'community' | 'custody'
  location?: string
}

type CourseParticipation = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  addedBy: string
  createdAt: string
  prisonNumber: Person['prisonNumber']
  courseId?: Course['id']
  otherCourseName?: string
  outcome?: CourseParticipationOutcome
  setting?: CourseParticipationSetting
  source?: string
}

type CourseParticipationWithName = CourseParticipation & {
  name: string
}

export type {
  CourseParticipation,
  CourseParticipationOutcome,
  CourseParticipationOutcomeStatus,
  CourseParticipationSetting,
  CourseParticipationWithName,
}
