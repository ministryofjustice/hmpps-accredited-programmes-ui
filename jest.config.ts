import type { Config } from 'jest'

const config: Config = {
  collectCoverageFrom: ['server/**/*.{ts,js,jsx,mjs}'],
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test_results/jest/',
      },
    ],
    [
      './node_modules/jest-html-reporter',
      {
        outputPath: 'test_results/unit-test-reports.html',
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
