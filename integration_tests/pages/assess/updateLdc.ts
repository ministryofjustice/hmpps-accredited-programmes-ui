import { StringUtils } from '../../../server/utils'
import Page from '../page'
import type { Person } from '@accredited-programmes/models'

export default class UpdateLdcPage extends Page {
  person: Person

  constructor(args: { person: Person }) {
    const { person } = args

    super('Update Learning disabilities and challenges (LDC)', {})

    this.person = person
  }

  shouldContainHasLdcContent() {
    this.shouldContainText(
      `${StringUtils.makePossessive(this.person.name)} current LDC status: May need an LDC-adapted programme`,
    )

    cy.get('[data-testid="target-status-heading"]').should(
      'contain.text',
      'Update status: Does not need an LDC-adapted programme',
    )

    cy.get('[data-testid="ldc-reason-fieldset"] legend').should(
      'contain.text',
      `You must give a reason why ${this.person.name} does not need an LDC-adapted programme.`,
    )

    this.shouldContainCheckboxItems([
      {
        text: 'The Adaptive Functioning Checklist (AFCR) suggested that they are not suitable for LDC programmes.',
        value: 'afcrSuggestion',
      },
      { text: 'Their learning screening tool scores have changed.', value: 'scoresChanged' },
      { text: "The What works for me meeting found that they didn't need an LDC programme.", value: 'whatWorksForMe' },
    ])
  }

  shouldContainNoLdcContent() {
    this.shouldContainText(
      `${StringUtils.makePossessive(this.person.name)} current LDC status: Does not need an LDC-adapted programme`,
    )

    cy.get('[data-testid="target-status-heading"]').should(
      'contain.text',
      'Update status: May need an LDC-adapted programme',
    )

    cy.get('[data-testid="ldc-reason-fieldset"] legend').should(
      'contain.text',
      `You must give a reason why ${this.person.name} may need an LDC-adapted programme.`,
    )

    this.shouldContainCheckboxItems([
      {
        text: 'The Adaptive Functioning Checklist (AFCR) suggested that they are suitable for LDC programmes.',
        value: 'afcrSuggestion',
      },
      { text: 'Their learning screening tool scores have changed.', value: 'scoresChanged' },
      {
        text: 'The What works for me meeting found that they were suitable for LDC programmes.',
        value: 'whatWorksForMe',
      },
    ])
  }
}
