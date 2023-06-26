## Context

<!-- Is there a Trello ticket you can link to? -->
<!-- Do you need to add any environment variables? -->
<!-- Is an ADR required? An ADR should be added if this PR introduces a change to the architecture. -->



## Changes in this PR



## Screenshots of UI changes

### Before


### After


## Release checklist

[Release process documentation](../doc/how-to/perform-a-release.md)

As part of our continuous deployment strategy we must ensure that this work is
ready to be released once merged.

### Pre-merge

- [ ] There are changes required to the Accredited Programmes API for this change to work...
  - [ ] ... and they been released to production already

### Post-merge

<!-- The outer checkboxes can be completed pre-merge -->

- [ ] This adds, extends or meaningfully modifies a feature...
  - [ ] ... and I have written or updated an end-to-end test for the happy path in the [Accredited Programmes E2E repo](https://github.com/ministryofjustice/hmpps-accredited-programmes-e2e)
- [ ] This makes new expectations of the API...
  - [ ] ... and I have notified the API developer(s) of changes to the contract tests (Pact), or the API is already compliant
- [ ] [Manually approve](../doc/how-to/perform-a-release.md#releasing-to-the-preprod-environment)
  release to preprod
- [ ] [Manually approve](../doc/how-to/perform-a-release.md#releasing-to-the-production-environment)
  release to prod

<!-- Should a release fail at any step, you as the author should now lead the work to
fix it as soon as possible. You can monitor deployment failures in CircleCI
itself and application errors are found in
[Sentry](https://ministryofjustice.sentry.io/projects/hmpps-accredited-programmes-ui/?project=4505330122686464&referrer=sidebar&statsPeriod=24h). -->
