import Page from '../page'

export default class ProgrammeHistoryDetailsPage extends Page {
  constructor() {
    // Conditional radio buttons add an additional `aria-expanded` field,
    // so ignore that rule on this page
    super('Add Accredited Programme details', { accessibilityRules: { 'aria-allowed-attr': { enabled: false } } })
  }

  shouldContainOutcomeDetailTextArea() {
    this.shouldContainTextArea('outcomeDetail', 'Can you provide additional detail? (if known)')
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
}
