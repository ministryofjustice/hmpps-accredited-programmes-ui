import type { CourseAudience } from './CourseAudience'
import type { CoursePrerequisite } from './CoursePrerequisite'
import type { TagColour } from '@accredited-programmes/ui'

export type Course = {
  id: string // eslint-disable-next-line @typescript-eslint/member-ordering
  alternateName: string | null
  audience: CourseAudience
  audienceColour: TagColour
  coursePrerequisites: Array<CoursePrerequisite>
  description: string
  displayName: string
  name: string
}
