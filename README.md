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

To start Docker, run all backing services including a local copy of the Accredited Programmes API (port 9091) and the Prison API (port 9092), and then the application itself, run:

```bash
  script/server
```

### With a mocked API

To run the application as above but with a mocked Accredited Programmes API (port 9099), run:

```bash
script/server --mock-api
```

API endpoint stubbing is set up in `/wiremock/scripts/stubApis.ts`.

## Running the tests

To run linting, typechecking and the test suite, run:

```bash
  script/test
```

By default, this will update backing service images (e.g. the API) and
dependencies. If you want skip the update when running the full test suite, run:

```bash
  script/test --skip-update
```

The Accredited Programmes API will run on port 9199 in the test environment.

### Running unit tests

You can run the suite of unit tests with:

```bash
  npm run test:unit
```

### Running end-to-end tests with Cypress

To run the end-to-end tests by themselves in a headless browser, run:

```bash
  npm run test:integration:cli
```

You can run them with the Cypress UI with:

```bash
  npm run test:integration:ui
```

#### Feature flag tests

We currently have a feature flag to prevent Refer pages and functionality from
being shown in the preproduction and production environments. We have a set of
separate tests to check that the feature flag works as expected. To run these,
run either of the following:

```bash
  npm run test:integration:refer-disabled:cli
```

```bash
  npm run test:integration:refer-disabled:ui
```
