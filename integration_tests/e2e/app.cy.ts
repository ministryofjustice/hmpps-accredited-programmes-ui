import helpers from '../support/helpers'

context('App', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Shows the phase banner with a link to the feedback form', () => {
    cy.signIn()
    cy.visit('/')

    cy.get('.govuk-phase-banner__content__tag').then(phaseBannerTagElement => {
      const { actual, expected } = helpers.parseHtml(phaseBannerTagElement, 'Beta')
      expect(actual).to.equal(expected)
    })

    cy.get('.govuk-phase-banner__text').then(phaseBannerTextElement => {
      const { actual, expected } = helpers.parseHtml(
        phaseBannerTextElement,
        'This is a new service - your feedback will help us to improve it.',
      )
      expect(actual).to.equal(expected)

      cy.wrap(phaseBannerTextElement).within(() => {
        cy.get('a').should(
          'have.attr',
          'href',
          'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2E8JCpI91GZDsQ5Hyq26MrZUQVQ5VFBIU0tKMUlZTDhLNUpZR01CQ0U5Uy4u',
        )
      })
    })
  })
})
