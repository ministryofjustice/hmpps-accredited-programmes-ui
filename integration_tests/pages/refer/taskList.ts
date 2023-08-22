import { CourseUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class TaskListPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  constructor(args: { course: Course; courseOffering: CourseOffering; organisation: Organisation }) {
    super('Make a referral')

    const { course, courseOffering, organisation } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
  }
}
