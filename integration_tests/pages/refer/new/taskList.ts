import { referPaths } from '../../../../server/paths'
import { CourseUtils, NewReferralUtils } from '../../../../server/utils'
import Helpers from '../../../support/helpers'
import Page from '../../page'
import type { CourseOffering, Organisation, Referral } from '@accredited-programmes/models'
import type { CoursePresenter } from '@accredited-programmes/ui'
import type { Course } from '@accredited-programmes-api'

export default class NewReferralTaskListPage extends Page {
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

  shouldBeReadyForSubmission() {
    cy.get('[data-testid="check-answers-tag"]')
      .parent()
      .within(() => {
        cy.get('a').should('have.attr', 'href', referPaths.new.checkAnswers({ referralId: this.referral.id }))
        cy.get('.govuk-tag').then(tagElement => {
          const { actual, expected } = Helpers.parseHtml(tagElement, 'Not started')
          expect(actual).to.equal(expected)
        })
      })
  }

  shouldContainTaskList() {
    const taskListSections = NewReferralUtils.taskListSections(this.referral)

    taskListSections.forEach((section, sectionIndex) => {
      cy.get(`.moj-task-list > li:nth-child(${sectionIndex + 1})`).within(() => {
        cy.get('.moj-task-list__section').should('have.text', section.heading)

        section.items.forEach((item, itemIndex) => {
          cy.get(`.moj-task-list__item:nth-child(${itemIndex + 1})`).within(() => {
            cy.get('.moj-task-list__task-name').then(taskNameElement => {
              cy.wrap(taskNameElement).should('have.text', item.text)

              if (item.url) {
                cy.wrap(taskNameElement).should('have.attr', 'href', item.url)
              }
            })

            cy.get('.govuk-tag').then(tagElement => this.shouldContainTag(item.statusTag, tagElement))
          })
        })
      })
    })
  }

  shouldHaveAdditionalInformation() {
    cy.get('[data-testid="additional-information-tag"]').then(additionalInformationTagElement => {
      this.shouldContainTag(
        { classes: 'govuk-tag moj-task-list__task-completed', text: 'Completed' },
        additionalInformationTagElement,
      )
    })
  }

  shouldHaveConfirmedOasys() {
    cy.get('[data-testid="confirm-oasys-tag"]').then(confirmOasysTagElement => {
      this.shouldContainTag(
        { classes: 'govuk-tag moj-task-list__task-completed', text: 'Completed' },
        confirmOasysTagElement,
      )
    })
  }

  shouldHaveReviewedProgrammeHistory() {
    cy.get('[data-testid="programme-history-tag"]').then(tagElement => {
      this.shouldContainTag({ classes: 'govuk-tag moj-task-list__task-completed', text: 'Completed' }, tagElement)
    })
  }

  shouldNotBeReadyForSubmission() {
    cy.get('[data-testid="check-answers-tag"]')
      .parent()
      .within(() => {
        cy.get('a').should('not.exist')
        cy.get('.govuk-tag').then(tagElement => {
          const { actual, expected } = Helpers.parseHtml(tagElement, 'Cannot start yet')
          expect(actual).to.equal(expected)
        })
      })
  }
}
