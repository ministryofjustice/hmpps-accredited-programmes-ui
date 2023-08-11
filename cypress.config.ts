import { defineConfig } from 'cypress'
import cypressMochawesomeReportPlugin from 'cypress-mochawesome-reporter/plugin'
import fs from 'fs'

import auth from './integration_tests/mockApis/auth'
import courses from './integration_tests/mockApis/courses'
import prisons from './integration_tests/mockApis/prisons'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import { resetStubs } from './wiremock'

export const defaultConfig: Cypress.ConfigOptions = {
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  downloadsFolder: 'test_results/integration/downloads',
  screenshotsFolder: 'test_results/integration/screenshots',
  videosFolder: 'test_results/integration/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'integration_tests/reporterConfig.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      cypressMochawesomeReportPlugin(on)

      on('task', {
        reset: resetStubs,
        ...auth,
        ...courses,
        ...prisons,
        ...tokenVerification,
        log(message) {
          console.log(message)

          return null
        },
        table(tableData) {
          console.table(tableData)

          return null
        },
      })

      on('after:spec', (_spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
        if (results?.video && results?.tests) {
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
}

export default defineConfig(defaultConfig)
