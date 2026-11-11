context('Health', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
  })

  context('All healthy', () => {
    beforeEach(() => {
      cy.task('stubTokenVerificationPing')
    })

    it('Health check is accessible and status is UP', () => {
      cy.request('/health').its('body.status').should('equal', 'UP')
    })

    it('Ping is accessible and status is UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is accessible', () => {
      cy.request('/info').its('body.build.name').should('equal', 'hmpps-accredited-programmes-ui')
    })
  })

  context('Some unhealthy', () => {
    it('Reports correctly when token verification down', () => {
      cy.task('stubTokenVerificationPing', 500)

      cy.request({ failOnStatusCode: false, method: 'GET', url: '/health' }).then(response => {
        expect(response.body.status).to.equal('DOWN')
        expect(response.body.components.hmppsAuth.status).to.equal('UP')
        expect(response.body.components.tokenVerification.status).to.equal('DOWN')
        expect(response.body.components.tokenVerification.details).to.contain({ attempts: 3, status: 500 })
      })
    })
  })
})
