# HMPPS Accredited Programmes UI

[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fhmpps-accredited-programmes-ui)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#hmpps-accredited-programmes-ui 'Link to report')
[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-accredited-programmes-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-accredited-programmes-ui)

## Prerequisites

- Docker
- NodeJS

## Setup

When running the application for the first time, run the following command:

```bash
script/setup
```

This will create `.env` files and bootstrap the application.

If you're coming back to the application after a certain amount of time, you can run:

```bash
script/bootstrap
```

## Running the application

### With the current API

To start Docker, run all backing services including a local copy of the current API (port 9092), and then the application itself, run:

```bash
  script/server
```

### With a mocked API

To run the application as above but with a mocked API (port 9093), run:

```bash
script/server --mock-api
```

API endpoint stubbing is set up in `/wiremock/stubApis.ts`.

## Running the tests

To run linting, typechecking and the test suite, run:

```bash
  script/test
```

The API will run on port 9091 in the test environment.

### Running unit tests

You can run the suite of unit tests with:

```bash
  npm run test
```

### Running end-to-end tests with Cypress

To run the end-to-end tests by themselves in a headless browser, run:

```bash
  npm run test:integration
```

You can run them with the Cypress UI with:

```bash
  npm run test:integration:ui
```
