import type { Course } from './Course'
import type { Person } from './Person'

type CourseParticipationOutcome = {
  detail?: string
  status?: 'complete' | 'incomplete'
  yearCompleted?: number
  yearStarted?: number
}

type CourseParticipationSetting = {
  location?: string
  type?: 'community' | 'custody'
}

type CourseParticipation = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  addedBy: string
  createdAt: string
  outcome: CourseParticipationOutcome
  prisonNumber: Person['prisonNumber']
  setting: CourseParticipationSetting
  courseId?: Course['id']
  otherCourseName?: string
  source?: string
}

type CourseParticipationUpdate = {
  outcome: CourseParticipationOutcome
  setting: CourseParticipationSetting
  courseId?: CourseParticipation['courseId']
  otherCourseName?: CourseParticipation['otherCourseName']
  source?: CourseParticipation['source']
}

type CourseParticipationWithName = CourseParticipation & {
  name: string
}

export type {
  CourseParticipation,
  CourseParticipationOutcome,
  CourseParticipationSetting,
  CourseParticipationUpdate,
  CourseParticipationWithName,
}
