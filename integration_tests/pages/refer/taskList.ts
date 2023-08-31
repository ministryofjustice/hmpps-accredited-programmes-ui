import { CourseUtils, ReferralUtils } from '../../../server/utils'
import Page from '../page'
import type { Course, CourseOffering, Organisation, Referral } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'

export default class TaskListPage extends Page {
  course: CoursePresenter

  courseOffering: CourseOffering

  organisation: Organisation

  referral: Referral

  constructor(args: {
    course: Course
    courseOffering: CourseOffering
    organisation: Organisation
    referral: Referral
  }) {
    super('Make a referral')

    const { course, courseOffering, organisation, referral } = args
    this.course = CourseUtils.presentCourse(course)
    this.courseOffering = courseOffering
    this.organisation = organisation
    this.referral = referral
  }

  shouldContainTaskList() {
    const taskListSections = ReferralUtils.taskListSections(this.referral)

    taskListSections.forEach((section, sectionIndex) => {
      cy.get(`.moj-task-list > li:nth-child(${sectionIndex + 1})`).within(() => {
        cy.get('.moj-task-list__section').should('have.text', section.heading)

        section.items.forEach((item, itemIndex) => {
          cy.get(`.moj-task-list__item:nth-child(${itemIndex + 1})`).within(listItemElement => {
            cy.get('.moj-task-list__task-name').then(taskNameElement => {
              cy.wrap(taskNameElement).should('have.text', item.text)

              if (item.url) {
                cy.wrap(taskNameElement).should('have.attr', 'href', item.url)
              }
            })

            this.shouldContainTags([item.statusTag], listItemElement)
          })
        })
      })
    })
  }
}
