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
  createdAt: string
  prisonNumber: Person['prisonNumber']
  courseId?: Course['id']
  detail?: string
  otherCourseName?: string
  outcome?: CourseParticipationOutcome
  setting?: CourseParticipationSetting
  source?: string
}

type CourseParticipationUpdate = {
  courseId?: CourseParticipation['courseId']
  detail?: CourseParticipation['detail']
  otherCourseName?: CourseParticipation['otherCourseName']
  outcome?: CourseParticipationOutcome
  setting?: CourseParticipationSetting
  source?: CourseParticipation['source']
}

export type { CourseParticipation, CourseParticipationOutcome, CourseParticipationSetting, CourseParticipationUpdate }
