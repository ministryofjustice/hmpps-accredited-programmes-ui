# HMPPS Accredited Programmes UI

[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fhmpps-accredited-programmes-ui)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#hmpps-accredited-programmes-ui 'Link to report')
[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-accredited-programmes-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-accredited-programmes-ui)

## Prerequisites

- Docker
- Node.js

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

To start Docker, run all backing services including a local copy of the Accredited Programmes API (port 9091) and the Prison Register (port 9092), a mocked version of the Prisoner Offender Search (see below), and then the application itself, run:

```bash
  script/server
```

As the Prisoner Offender Search is a complex API with multiple dependencies, we've opted to mock it when running locally. The above script will generate two mocked people in prison to be served from the Prison Offender Search `/prisoner/:prisonNumber` endpoint with details available in `/wiremock/stubs/prisoners.json`.

### With a mocked API

**Warning:** the mocked API currently only covers the Find journey and searching for a person before creating a referral. The rest of the Refer journey will not work with a mocked API at present.

To run the application as above but with a mocked Accredited Programmes API (port 9099), run:

```bash
script/server --mock-api
```

API endpoint stubbing is set up in `/wiremock/scripts/stubApis.ts`.


### Local user accounts

There are three user accounts with different roles that can be used when running the application locally:

| Username | Description | Roles | Password |
| ---- | ---- | ---- | ---- |
| `ACP_POM_USER` | Prisoner Offender Manager user - responsible for making referrals and viewing the progress of a referral  | `POM`, `ACP_REFERRER` | `password123456` |
| `ACP_PT_USER`  | Programme Team user - responsible for assessing the suitability of a person to an Accredited Programme and updating the status of referrals | `ACP_PROGRAMME_TEAM` | `password123456` |
| `ACP_PT_REFERRER_USER` | Programme Team user - all the responsibilities of a Programme Team user above, but with the ability to also make referrals | `ACP_PROGRAMME_TEAM`, `ACP_REFERRER` | `password123456` |

### Seeded resources

The local copy of the Accredited Programmes API has various seeds in place providing data to work with in local development. These include courses, course offerings, and associated data, as well as one referral. This referral is at the stage of having just been created, and can be used to jump to the task list part of the Refer journey.

Seeded referral ID and local server link: [c11fab18-dc8d-420c-9c82-d0edd373732d](http://localhost:3000/refer/new/referrals/c11fab18-dc8d-420c-9c82-d0edd373732d)

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
