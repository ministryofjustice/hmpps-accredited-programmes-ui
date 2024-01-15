/* eslint-disable no-console */

import type { ReturnsSuperAgentRequest } from '..'
import { processStubs, stubFor } from '..'
import { apiPaths } from '../../server/paths'
import {
  caseloads,
  courseOfferings,
  courseParticipations,
  courses,
  oasysOffenceDetail,
  oasysRoshAnalysis,
  prisoners,
  referralSummaries,
  referrals,
} from '../stubs'
import type { Caseload } from '@prison-api'

const stubs: Array<ReturnsSuperAgentRequest> = []
const activeCaseLoadId = caseloads.find(caseload => caseload.currentlyActive)?.caseLoadId as Caseload['caseLoadId']
const draftReferralSummaries = referralSummaries.filter(
  referralSummary => referralSummary.status === 'referral_started',
)
const openReferralSummaries = referralSummaries.filter(referralSummary => referralSummary.status !== 'referral_started')

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: apiPaths.courses.index({}),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courses,
      status: 200,
    },
  }),
)

courses.forEach(course => {
  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.show({ courseId: course.id }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: course,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.courses.offerings({ courseId: course.id }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courseOfferings,
        status: 200,
      },
    }),
  )
})

courseOfferings.forEach(courseOffering => {
  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.show({ courseOfferingId: courseOffering.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseOffering,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.course({ courseOfferingId: courseOffering.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courses[0],
        status: 200,
      },
    }),
  )
})

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: apiPaths.people.participations({ prisonNumber: prisoners[1].prisonerNumber }),
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: courseParticipations,
      status: 200,
    },
  }),
)

referrals.forEach(referral => {
  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.show({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: referral,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'PUT',
        url: apiPaths.referrals.update({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        status: 204,
      },
    }),
  )
})

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: apiPaths.organisations.courses({ organisationId: activeCaseLoadId }),
    },
    response: {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courses,
      status: 200,
    },
  }),
)

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: `${apiPaths.referrals.dashboard({
        organisationId: activeCaseLoadId,
      })}?courseName=Becoming%20New%20Me%20Plus&status=ASSESSMENT_STARTED%2CAWAITING_ASSESSMENT%2CREFERRAL_SUBMITTED&size=15`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: openReferralSummaries,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: openReferralSummaries.length,
        totalPages: 1,
      },
      status: 200,
    },
  }),
)

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: `${apiPaths.referrals.myDashboard(
        {},
      )}?status=ASSESSMENT_STARTED%2CAWAITING_ASSESSMENT%2CREFERRAL_SUBMITTED&size=15`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: openReferralSummaries,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: openReferralSummaries.length,
        totalPages: 1,
      },
      status: 200,
    },
  }),
)

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      url: `${apiPaths.referrals.myDashboard({})}?status=REFERRAL_STARTED&size=15`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: draftReferralSummaries,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: draftReferralSummaries.length,
        totalPages: 1,
      },
      status: 200,
    },
  }),
)

prisoners.forEach(prisoner => {
  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.offenceDetails({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysOffenceDetail,
        status: 200,
      },
    }),
  )
})

prisoners.forEach(prisoner => {
  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.roshAnalysis({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysRoshAnalysis,
        status: 200,
      },
    }),
  )
})

console.log('Stubbing Accredited Programmes API')
processStubs(stubs)
