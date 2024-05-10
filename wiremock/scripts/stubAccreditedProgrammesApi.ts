/* eslint-disable no-console */

import type { ReturnsSuperAgentRequest } from '..'
import { processStubs, stubFor } from '..'
import { apiPaths } from '../../server/paths'
import {
  caseloads,
  courseOfferings,
  courseParticipations,
  courses,
  oasysAttitude,
  oasysBehaviour,
  oasysHealth,
  oasysLearningNeeds,
  oasysLifestyle,
  oasysOffenceDetail,
  oasysRelationships,
  oasysRisksAndAlerts,
  oasysRoshAnalysis,
  prisoners,
  psychiatric,
  referralStatuses,
  referralViews,
  referrals,
} from '../stubs'
import type { Caseload } from '@prison-api'

const stubs: Array<ReturnsSuperAgentRequest> = []
const activeCaseLoadId = caseloads.find(caseload => caseload.currentlyActive)?.caseLoadId as Caseload['caseLoadId']
const draftReferralViews = referralViews.filter(referralView => referralView.status === 'referral_started')
const openReferralViews = referralViews.filter(referralView => referralView.status !== 'referral_started')

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
        urlPath: apiPaths.referrals.show({ referralId: referral.id }),
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

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: apiPaths.referrals.statusHistory({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
        status: 201,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.referrals.statusTransitions({ referralId: referral.id }),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
        status: 201,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.offerings.course({
          courseOfferingId: referral.offeringId,
        }),
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
      urlPath: `${apiPaths.referrals.dashboard({
        organisationId: activeCaseLoadId,
      })}`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: openReferralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: openReferralViews.length,
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
      urlPath: `${apiPaths.referenceData.referralStatuses.show({
        organisationId: activeCaseLoadId,
      })}`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: referralStatuses,
      status: 200,
    },
  }),
)

stubs.push(() =>
  stubFor({
    request: {
      method: 'GET',
      queryParameters: {
        size: {
          equalTo: '15',
        },
      },
      urlPath: `${apiPaths.referrals.myDashboard({})}`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: openReferralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: openReferralViews.length,
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
      queryParameters: {
        size: {
          equalTo: '15',
        },
        status: {
          equalTo: 'REFERRAL_STARTED',
        },
      },
      urlPath: `${apiPaths.referrals.myDashboard({})}`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {
        content: draftReferralViews,
        pageIsEmpty: false,
        pageNumber: 0,
        pageSize: 15,
        totalElements: draftReferralViews.length,
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
        url: apiPaths.oasys.attitude({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysAttitude,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.behaviour({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysBehaviour,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.health({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysHealth,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.learningNeeds({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysLearningNeeds,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.lifestyle({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysLifestyle,
        status: 200,
      },
    }),
  )

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

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.psychiatric({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: psychiatric,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.relationships({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysRelationships,
        status: 200,
      },
    }),
  )

  stubs.push(() =>
    stubFor({
      request: {
        method: 'GET',
        url: apiPaths.oasys.risksAndAlerts({ prisonNumber: prisoner.prisonerNumber }),
      },
      response: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: oasysRisksAndAlerts,
        status: 200,
      },
    }),
  )

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

  stubs.push(() =>
    stubFor({
      request: {
        bodyPatterns: [
          {
            equalToJson: {
              prisonerIdentifier: prisoner.prisonerNumber,
            },
            ignoreExtraElements: true,
          },
        ],
        method: 'POST',
        url: apiPaths.person.prisonerSearch({}),
      },
      response: {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [prisoner],
        status: 200,
      },
    }),
  )
})

console.log('Stubbing Accredited Programmes API')
processStubs(stubs)
