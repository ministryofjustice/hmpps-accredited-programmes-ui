import Page from '../../page'
import type { Course, CourseParticipation } from '@accredited-programmes/models'

export default class NewReferralSelectProgrammePage extends Page {
  courses: Array<Course>

  constructor(args: { courses: Array<Course> }) {
    // Conditional radio buttons add an additional `aria-expanded` field,
    // so ignore that rule on this page
    super('Add Accredited Programme history', { accessibilityRules: { 'aria-allowed-attr': { enabled: false } } })

    const { courses } = args
    this.courses = courses
  }

  selectCourse(value: string) {
    this.selectRadioButton('courseName', value)
  }

  shouldContainCourseOptions() {
    this.shouldContainRadioItems([
      ...this.courses.map(course => ({ text: course.name, value: course.name })),
      { text: 'Other', value: 'Other' },
    ])
  }

  shouldDisplayOtherCourseInput() {
    this.selectRadioButton('courseName', 'Other')
    cy.get('input[name="otherCourseName"]').should('be.visible')
  }

  shouldHaveSelectedCourse(courseName: CourseParticipation['courseName'], isKnownCourse: boolean) {
    if (isKnownCourse) {
      cy.get(`.govuk-radios__input[value="${courseName}"]`).should('be.checked')
    } else {
      cy.get('.govuk-radios__input[value="Other"]').should('be.checked')
      cy.get('#otherCourseName').should('have.value', courseName)
    }
  }

  shouldNotDisplayOtherCourseInput() {
    cy.get('input[name="otherCourseName"]').should('not.be.visible')
  }

  submitSelection(courseParticipation: CourseParticipation, selectedCourseName: Course['name']) {
    cy.task('stubParticipation', { ...courseParticipation, courseName: selectedCourseName })
    this.shouldContainButton('Continue').click()
  }
}
