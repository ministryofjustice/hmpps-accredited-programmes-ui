# 7. Send audit events to HMPPS Audit

Date: 2023-10-24

## Status

Accepted

## Context

As per [this
ADR](https://dsdmoj.atlassian.net/wiki/spaces/NDSS/pages/4061822977/ADR+-+Audit+event+capture),
there's a requirement for services at HMPPS to send audit events of:

- All updates to data
- All views of personal data

And the following details:

- User identifier - if in doubt, username or email address
- Date and time - to at least the second level, ideally to millisecond
- Data entity identifier - usually the most sensible ID for the Person record
being viewed - CRN, Prison Number or something else
- What is being viewed - not too fine-grained - “person risks” is appropriate, a
list of each of the risks would not be. We think storing the page name might
work, and if there’s a tab structure within pages, storing the tab name may
also be appropriate. It is deliberate that we are talking about front-end
interactions here - “what was the user doing?” rather than “what was the system
doing to support the user’s request?”.

## Decision

We'll use middleware to send audit events for all steps in the Refer journey,
as this involves users viewing and updating personal data about a person. We'll
continue to send audit events for other parts of the service e.g Assess that
involve interactions with personal data, too.

## Consequences

We'll need to remember to add audit events for new routes.
