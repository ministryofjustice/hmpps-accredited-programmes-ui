import type { CourseAudience } from './CourseAudience'
import type { CoursePrerequisite } from './CoursePrerequisite'

export type Course = {
  id: string
  name: string
  type: string
  description: string
  audiences: Array<CourseAudience>
  coursePrerequisites: Array<CoursePrerequisite>
}
