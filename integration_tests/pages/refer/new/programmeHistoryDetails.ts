import Page from '../../page'
import type { Person } from '@accredited-programmes/models'
import type { Course, CourseParticipation } from '@accredited-programmes-api'

export default class NewReferralProgrammeHistoryDetailsPage extends Page {
  course: Course

  courseParticipation: CourseParticipation

  person: Person

  constructor(args: { course: Course; courseParticipation: CourseParticipation; person: Person }) {
    // Conditional radio buttons add an additional `aria-expanded` field,
    // so ignore that rule on this page
    super('Add Accredited Programme details', {
      accessibilityRules: { 'aria-allowed-attr': { enabled: false } },
      hideTitleServiceName: true,
    })

    const { course, courseParticipation, person } = args
    this.course = course
    this.courseParticipation = courseParticipation
    this.person = person
  }

  inputCommunityLocation(value: string) {
    cy.get('input[id="communityLocation"]').type(value)
  }

  inputDetail(value: string) {
    cy.get('textarea[id="detail"]').type(value)
  }

  inputOutcomeYearCompleted(value: string) {
    cy.get('input[id="yearCompleted"]').type(value)
  }

  inputOutcomeYearStarted(value: string) {
    cy.get('input[id="yearStarted"]').type(value)
  }

  inputSource(value: string) {
    cy.get('textarea[id="source"]').type(value)
  }

  selectOutcome(value: string) {
    this.selectRadioButton('outcome[status]', value)
  }

  selectSetting(value: string) {
    this.selectRadioButton('setting[type]', value)
  }

  shouldContainDetailTextArea() {
    this.shouldContainTextArea('detail', 'Provide additional detail (if known)')
  }

  shouldContainOutcomeRadioItems() {
    cy.get('[data-testid="outcome-options"]').within(() => {
      this.shouldContainRadioItems([
        { text: 'Complete If complete, optionally enter the year completed.', value: 'complete' },
        { text: 'Incomplete If incomplete, optionally enter the year started.', value: 'incomplete' },
      ])
    })
  }

  shouldContainSettingRadioItems() {
    cy.get('[data-testid="setting-options"]').within(() => {
      this.shouldContainRadioItems([
        { text: 'Community If community setting, optionally enter the location.', value: 'community' },
        { text: 'Custody If custody setting, optionally enter the location.', value: 'custody' },
      ])
    })
  }

  shouldContainSourceTextArea() {
    this.shouldContainTextArea('source', 'Provide the source (optional)')
  }

  shouldDisplayCommunityLocationInput() {
    this.selectRadioButton('setting[type]', 'community')
    cy.get('input[id="communityLocation"]').should('be.visible')
  }

  shouldDisplayCustodyLocationInput() {
    this.selectRadioButton('setting[type]', 'custody')
    cy.get('input[id="custodyLocation"]').should('be.visible')
  }

  shouldDisplayYearCompletedInput() {
    this.selectRadioButton('outcome[status]', 'complete')
    cy.get('input[id="yearCompleted"]').should('be.visible')
  }

  shouldDisplayYearStartedInput() {
    this.selectRadioButton('outcome[status]', 'incomplete')
    cy.get('input[id="yearStarted"]').should('be.visible')
  }

  shouldHaveCorrectFormValues() {
    const { detail, setting, outcome, source } = this.courseParticipation

    if (setting?.type === 'community') {
      cy.get('[data-testid="community-setting-option"]').should('be.checked')

      if (setting.location) {
        cy.get('input[id="communityLocation"]').should('have.value', setting.location)
      }
    }

    if (setting?.type === 'custody') {
      cy.get('[data-testid="custody-setting-option"]').should('be.checked')

      if (setting.location) {
        cy.get('input[id="custodyLocation"]').should('have.value', setting.location)
      }
    }

    if (outcome?.status === 'complete') {
      cy.get('[data-testid="complete-outcome-option"]').should('be.checked')

      if (outcome.yearCompleted) {
        cy.get('input[id="yearCompleted"]').should('have.value', outcome.yearCompleted)
      }
    }

    if (outcome?.status === 'incomplete') {
      cy.get('[data-testid="incomplete-outcome-option"]').should('be.checked')

      if (outcome.yearStarted) {
        cy.get('input[id="yearStarted"]').should('have.value', outcome.yearStarted)
      }
    }

    if (detail) {
      cy.get('textarea[id="detail"]').should('have.value', detail)
    }

    if (source) {
      cy.get('textarea[id="source"]').should('have.value', source)
    }
  }

  shouldNotDisplayCommunityLocationInput() {
    cy.get('input[id="communityLocation"]').should('not.be.visible')
  }

  shouldNotDisplayCustodyLocationInput() {
    cy.get('input[id="custodyLocation"]').should('not.be.visible')
  }

  shouldNotDisplayYearCompletedInput() {
    cy.get('input[id="yearCompleted"]').should('not.be.visible')
  }

  shouldNotDisplayYearStartedInput() {
    cy.get('input[id="yearStarted"]').should('not.be.visible')
  }

  submitDetails() {
    cy.task('stubUpdateParticipation', this.courseParticipation)
    cy.task('stubCourse', this.course)
    cy.task('stubParticipationsByPerson', {
      courseParticipations: [],
      prisonNumber: this.person.prisonNumber,
    })
    cy.task('stubParticipationsByReferral', {
      courseParticipations: [this.courseParticipation],
      referralId: this.courseParticipation.referralId,
    })
    this.shouldContainButton('Continue').click()
  }
}
