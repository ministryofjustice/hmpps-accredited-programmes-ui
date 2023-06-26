import type { CourseAudience } from './CourseAudience'
import type { CoursePrerequisite } from './CoursePrerequisite'

export type Course = {
  id: string
  name: string
  alternateName: string | null
  description: string
  audiences: Array<CourseAudience>
  coursePrerequisites: Array<CoursePrerequisite>
}
