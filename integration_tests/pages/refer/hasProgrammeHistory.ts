import Page from '../page'
import type { Person, Referral } from '@accredited-programmes/models'

export default class HasProgrammeHistoryPage extends Page {
  person: Person

  referral: Referral

  constructor(args: { person: Person; referral: Referral }) {
    super('Add Accredited Programme history')

    const { person, referral } = args
    this.person = person
    this.referral = referral
  }

  confirmHasProgrammeHistory(value: Referral['hasCourseHistory'] = true) {
    cy.get(`[name="hasCourseHistory"][value="${value}"]`).check()
    this.referral = { ...this.referral, hasCourseHistory: value }
    // We're stubbing the referral here to make sure the updated referral is available on the task list page
    cy.task('stubReferral', this.referral)
    this.shouldContainButton('Continue').click()
  }

  shouldContainContinueButton() {
    this.shouldContainButton('Continue')
  }

  shouldContainExplanationParagraph() {
    cy.get('[data-testid="explanation-paragraph"]').should(
      'have.text',
      "The programme team may use information about a person's Accredited Programme history to assess whether a person is suitable for the referred programme.",
    )
  }

  shouldContainHasProgrammeHistoryRadios() {
    cy.get('[data-testid="has-course-history-radios"]').then(hasCourseHistoryRadiosElement => {
      const label = `Are you aware of ${this.person.name} previously completing or starting an Accredited Programme?`

      this.shouldContainRadios(
        'hasCourseHistory',
        label,
        [
          { text: 'Yes', value: 'true' },
          { text: 'No', value: 'false' },
        ],
        hasCourseHistoryRadiosElement,
      )
    })
  }
}
