import type { CoursePrerequisite } from './CoursePrerequisite'

export type Course = {
  id: string
  name: string
  type: string
  description: string
  coursePrerequisites: Array<CoursePrerequisite>
}
