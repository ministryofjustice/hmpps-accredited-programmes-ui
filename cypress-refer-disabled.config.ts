import { defineConfig } from 'cypress'

import { defaultConfig } from './cypress.config'

const referDisabledConfig = {
  ...defaultConfig,
  downloadsFolder: 'test_results/integration/refer_disabled/downloads',
  screenshotsFolder: 'test_results/integration/refer_disabled/screenshots',
  videosFolder: 'test_results/integration/refer_disabled/videos',
  reporterOptions: {
    ...defaultConfig.reporterOptions,
    configFile: 'integration_tests/reporterConfigReferDisabled.json',
  },
  e2e: {
    ...defaultConfig.e2e,
    specPattern: 'integration_tests/e2eReferDisabled/**/*.cy.{js,jsx,ts,tsx}',
  },
}

export default defineConfig(referDisabledConfig)
