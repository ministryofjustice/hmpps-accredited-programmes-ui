import Page from '../page'
import type { Course, CourseParticipation } from '@accredited-programmes/models'

export default class SelectProgrammePage extends Page {
  courses: Array<Course>

  constructor(args: { courses: Array<Course> }) {
    // Conditional radio buttons add an additional `aria-expanded` field,
    // so ignore that rule on this page
    super('Add Accredited Programme history', { accessibilityRules: { 'aria-allowed-attr': { enabled: false } } })

    const { courses } = args
    this.courses = courses
  }

  selectCourse(value: string) {
    this.selectRadioButton('courseId', value)
  }

  shouldContainCourseOptions() {
    this.shouldContainRadioItems([
      ...this.courses.map(course => ({ label: course.name, value: course.id })),
      { label: 'Other', value: 'other' },
    ])
  }

  shouldDisplayOtherCourseInput() {
    cy.get('[data-testid="other-course-option"]').check()
    cy.get(`input[name="otherCourseName"]`).should('be.visible')
  }

  shouldHaveSelectedCourse(
    courseId: CourseParticipation['courseId'],
    otherCourseName?: CourseParticipation['otherCourseName'],
  ) {
    cy.get(`.govuk-radios__input[value="${courseId}"]`).should('be.checked')

    if (otherCourseName) {
      cy.get('#otherCourseName').should('have.value', otherCourseName)
    }
  }

  shouldNotDisplayOtherCourseInput() {
    cy.get(`input[name="otherCourseName"]`).should('not.be.visible')
  }

  submitSelection(courseParticipation: CourseParticipation, selectedCourseId: Course['id']) {
    cy.task('stubParticipation', { ...courseParticipation, courseId: selectedCourseId })
    this.shouldContainButton('Continue').click()
  }
}
