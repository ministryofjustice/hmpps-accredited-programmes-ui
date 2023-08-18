import type { CourseAudience } from './CourseAudience'
import type { CoursePrerequisite } from './CoursePrerequisite'

export type Course = {
  alternateName: string | null
  audiences: Array<CourseAudience>
  coursePrerequisites: Array<CoursePrerequisite>
  description: string
  id: string
  name: string
}
