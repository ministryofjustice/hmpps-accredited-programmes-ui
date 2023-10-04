import Page from '../page'
import type { Course, CourseParticipation, Person } from '@accredited-programmes/models'

export default class ProgrammeHistoryDetailsPage extends Page {
  constructor() {
    // Conditional radio buttons add an additional `aria-expanded` field,
    // so ignore that rule on this page
    super('Add Accredited Programme details', { accessibilityRules: { 'aria-allowed-attr': { enabled: false } } })
  }

  inputCommunityLocation(value: string) {
    cy.get('input[id="communityLocation"]').type(value)
  }

  inputOutcomeDetail(value: string) {
    cy.get('textarea[id="outcomeDetail"]').type(value)
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

  shouldContainOutcomeDetailTextArea() {
    this.shouldContainTextArea('outcomeDetail', 'Provide additional detail (if known)')
  }

  shouldContainOutcomeRadioItems() {
    cy.get('[data-testid="outcome-options"]').within(() => {
      this.shouldContainRadioItems([
        { label: 'Complete', value: 'complete' },
        { label: 'Incomplete', value: 'incomplete' },
      ])
    })
  }

  shouldContainSettingRadioItems() {
    cy.get('[data-testid="setting-options"]').within(() => {
      this.shouldContainRadioItems([
        { label: 'Community', value: 'community' },
        { label: 'Custody', value: 'custody' },
      ])
    })
  }

  shouldContainSourceTextArea() {
    this.shouldContainTextArea('source', 'Provide the source')
  }

  shouldDisplayCommunityLocationInput() {
    cy.get('[data-testid="community-setting-option"]').check()
    cy.get('input[id="communityLocation"]').should('be.visible')
  }

  shouldDisplayCustodyLocationInput() {
    cy.get('[data-testid="custody-setting-option"]').check()
    cy.get('input[id="custodyLocation"]').should('be.visible')
  }

  shouldDisplayYearCompletedInput() {
    cy.get('[data-testid="complete-outcome-option"]').check()
    cy.get('input[id="yearCompleted"]').should('be.visible')
  }

  shouldDisplayYearStartedInput() {
    cy.get('[data-testid="incomplete-outcome-option"]').check()
    cy.get('input[id="yearStarted"]').should('be.visible')
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

  submitDetails(courseParticipation: CourseParticipation, course: Course, person: Person) {
    cy.task('stubUpdateParticipation', courseParticipation)
    cy.task('stubCourse', course)
    cy.task('stubParticipationsByPerson', {
      courseParticipations: [courseParticipation],
      prisonNumber: person.prisonNumber,
    })
    this.shouldContainButton('Continue').click()
  }
}
