import type { Course } from './Course'
import type { Person } from './Person'

type CourseParticipationOutcome = {
  status: 'complete' | 'incomplete'
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
  courseName: Course['name']
  createdAt: string
  prisonNumber: Person['prisonNumber']
  detail?: string
  outcome?: CourseParticipationOutcome
  setting?: CourseParticipationSetting
  source?: string
}

type CourseParticipationUpdate = {
  courseName: CourseParticipation['courseName']
  detail?: CourseParticipation['detail']
  outcome?: CourseParticipationOutcome
  setting?: CourseParticipationSetting
  source?: CourseParticipation['source']
}

export type { CourseParticipation, CourseParticipationOutcome, CourseParticipationSetting, CourseParticipationUpdate }
