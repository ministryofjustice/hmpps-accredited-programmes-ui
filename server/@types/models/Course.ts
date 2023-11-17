import type { CourseAudience } from './CourseAudience'
import type { CoursePrerequisite } from './CoursePrerequisite'

export type Course = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  alternateName: string | null
  audiences: Array<CourseAudience>
  coursePrerequisites: Array<CoursePrerequisite>
  description: string
  name: string
  referable: boolean
}
