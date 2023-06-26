import { defineConfig } from 'cypress'
import fs from 'fs'

import auth from './integration_tests/mockApis/auth'
import courses from './integration_tests/mockApis/courses'
import prisons from './integration_tests/mockApis/prisons'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import { resetStubs } from './wiremock'

export default defineConfig({
  chromeWebSecurity: false,
  downloadsFolder: 'integration_tests/downloads',
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...courses,
        ...prisons,
        ...tokenVerification,
      })

      on('after:spec', (_spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
        if (results?.video) {
          const hasFailures = results.tests.some(test => test.attempts.some(attempt => attempt.state === 'failed'))

          if (!hasFailures) {
            fs.unlinkSync(results.video)
          }
        }
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
