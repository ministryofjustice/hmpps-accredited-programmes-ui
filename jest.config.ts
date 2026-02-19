import type { Config } from 'jest'

const config: Config = {
  collectCoverage: true,
  collectCoverageFrom: [
    'server/**/*.{ts,js,jsx,mjs}',
    '!server/authentication/*.ts',
    '!server/middleware/*.ts',
    '!server/routes/*.ts',
    '!server/testutils/factories/*.ts',
  ],
  coverageDirectory: 'test_results/unit/coverage',
  coverageThreshold: {
    global: {
      functions: 99.5,
    },
  },
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputFile: 'test_results/unit/xml/results-for-ci-report.xml',
      },
    ],
    [
      './node_modules/jest-html-reporter',
      {
        includeFailureMsg: true,
        outputPath: 'test_results/unit/results.html',
        pageTitle: 'HMPPS Accredited Programmes - Unit Test Report',
        sort: 'status',
      },
    ],
  ],
  showSeed: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/(server|job)/**/?(*.)(cy|test).{ts,js,jsx,mjs}'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
}

export default config
