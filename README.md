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

To start Docker, run all backing services including a local copy of the Accredited Programmes API (port 9091) and the Prison Register (port 9092), a mocked version of the Prisoner Search (see below), and then the application itself, run:

```bash
  script/server
```

As the Prisoner Search is a complex API with multiple dependencies, we've opted to mock it when running locally. The above script will generate two mocked people in prison to be served from the Prisoner Search `/prisoner/:prisonNumber` endpoint with details available in `/wiremock/stubs/prisoners.json`.

### With a mocked API

**Warning:** the mocked API currently only covers the Find journey and searching for a person before creating a referral. The rest of the Refer journey will not work with a mocked API at present.

To run the application as above but with a mocked Accredited Programmes API (port 9099), run:

```bash
script/server --mock-api
```

API endpoint stubbing is set up in `/wiremock/scripts/stubApis.ts`.

### Local user accounts

There are three user accounts with different roles that can be used when running the application locally:

| Username               | Description                                                                                                                                 | Roles                                | Password         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------- |
| `ACP_POM_USER`         | Prisoner Offender Manager user - responsible for making referrals and viewing the progress of a referral                                    | `POM`, `ACP_REFERRER`                | `password123456` |
| `ACP_PT_USER`          | Programme Team user - responsible for assessing the suitability of a person to an Accredited Programme and updating the status of referrals | `ACP_PROGRAMME_TEAM`                 | `password123456` |
| `ACP_PT_REFERRER_USER` | Programme Team user - all the responsibilities of a Programme Team user above, but with the ability to also make referrals                  | `ACP_PROGRAMME_TEAM`, `ACP_REFERRER` | `password123456` |

### Seeded resources

The local copy of the Accredited Programmes API has various seeds in place providing data to work with in local development. These include courses, course offerings, referrals, and associated data.

The SQL used to generate the seed data can be viewed at [hmpps-accredited-programmes-api/blob/main/src/main/resources/seed/db/migration/R\_\_Seed_Data.sql](https://github.com/ministryofjustice/hmpps-accredited-programmes-api/blob/main/src/main/resources/seed/db/migration/R__Seed_Data.sql).

If the seeds no longer meet our needs and need updating, the process is as follows:

1. update the relevant parts of [generate-api-seeds/script/utils/generateApiSeeds](https://github.com/ministryofjustice/hmpps-accredited-programmes-ui/blob/main/script/utils/generateApiSeeds)
1. run `generate-api-seeds`, which will output a new API SQL script to the terminal
1. copy this output into the API seed file (linked above) and open a pull request with the changes
1. merge the pull request and await completion of the `build_docker` CircleCI job
1. update the API Docker image in your local copy of the the UI repository

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

## Using Postman

We have a Postman team for interacting with APIs - please ask to be added to it.

You'll need to populate secret environment variables in the `Environments`
section of Postman.

**Ensure you put these in the "Current value" box, rather than "Initial value"
or they will be shared!**

### Local

These secrets can be copied across from `.env.example` in this repo.

### Dev & Dev (API credentials)

You can use project-specific credentials for interacting with dev APIs. You'll
need to fetch the secrets for this section from Kubernetes.

See instructions in the [Manage Infrastructure
docs](./doc/how-to/manage-infrastructure.md#viewing-an-individual-set-of-secrets)
for accessing these secrets.

### Preprod

You'll need to have a personal client created for you by the HMPPS Auth, Audit
and Registers team to view preprod data. This will require you to have Security
Clearance and be on the MOJ VPN. Ask for this in the
`#hmpps-auth-audit-registers` Slack channel.
