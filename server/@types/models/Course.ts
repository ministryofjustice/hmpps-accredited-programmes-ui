import { CoursePrerequisite } from './CoursePrerequisite'

export type Course = {
  name: string
  type: string
  description: string
  coursePrerequisites: Array<CoursePrerequisite>
}
