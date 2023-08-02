# 5. Use Application Insights for client side monitoring

Date: 2023-08-02

## Status

Accepted

## Context

[Defining what success looks like and publishing performance
data](https://www.gov.uk/service-manual/service-standard/point-10-define-success-publish-performance-data)
is one of the key principles of the GOV.UK Service Standard. Collecting
performance data and data about how users are using the service allows us to
know whether the service is solving the problem it's meant to solve.

HMPPS has a wide variety of projects using different tools for monitoring
service performance - there doesn't appear to be a one-size-fits-all approach.
However, the HMPPS TypeScript template integrates with Azure Application
Insights by default, but requires some modification to track real-time user
behaviour.

## Decision

We'll use Azure Application Insights for monitoring performance and to provide
an insight into how users are using the service.

We'll specifically be using this to help us monitor:

- Service availability
- Page load times
- Total page errors
- Digital take up
- User satisfaction

## Consequences

Using Application Insights for client side monitoring will quicker to set up
than other tools due to the fact that we're already sending backend server
events to it as a result of extending the standard HMPPS TypeScript template.

Although we're choosing to use Application Insights at this point in time, there
may be a wider organisational push in future to move to report on these metrics
in Power BI. However, this isn't something we're required to use at the moment
and will require additional overhead in setting up and configuring.
