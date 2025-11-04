import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import ProgrammeHistoryDetailController from './programmeHistoryDetailController'
import { assessPaths, referPaths } from '../../paths'
import assess from '../../paths/assess'
import refer from '../../paths/refer'
import type { CourseService, PersonService, ReferralService } from '../../services'
import {
  courseFactory,
  courseParticipationFactory,
  personFactory,
  referralFactory,
  userFactory,
} from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import type { GovukFrontendSummaryListWithRowsWithKeysAndValues } from '@accredited-programmes/ui'

describe('ProgrammeHistoryDetailController', () => {
  const username = 'SOME_USERNAME'
  const userToken = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let controller: ProgrammeHistoryDetailController

  const addedByUser = userFactory.build()
  const course = courseFactory.build()
  const person = personFactory.build()
  const courseParticipation = courseParticipationFactory.build({
    addedBy: addedByUser.username,
    courseName: course.name,
    prisonNumber: person.prisonNumber,
  })
  const referral = referralFactory.build({ prisonNumber: person.prisonNumber })

  const summaryListOptions = 'summary list options' as unknown as GovukFrontendSummaryListWithRowsWithKeysAndValues

  beforeEach(() => {
    request = buildRequest()
    response = Helpers.createMockResponseWithCaseloads()

    controller = new ProgrammeHistoryDetailController(courseService, personService, referralService)
    courseService.presentCourseParticipation.mockResolvedValue(summaryListOptions)
    courseService.getParticipation.mockResolvedValue(courseParticipation)
    personService.getPerson.mockResolvedValue(person)
    referralService.getReferral.mockResolvedValue(referral)
  })

  function buildRequest(path?: string): DeepMocked<Request> {
    return createMock<Request>({
      params: {
        courseParticipationId: courseParticipation.id,
        referralId: referral.id,
      },
      ...(path ? { path } : {}),
      user: {
        token: userToken,
        username,
      },
    })
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    describe('when the request is for a new referral', () => {
      beforeEach(() => {
        request = buildRequest(
          referPaths.new.programmeHistory.show({
            courseParticipationId: courseParticipation.id,
            referralId: referral.id,
          }),
        )
      })

      it('renders the show programme history detail template for a specific course participation', async () => {
        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, request.params.referralId)
        expect(courseService.getParticipation).toHaveBeenCalledWith(username, courseParticipation.id)
        expect(courseService.presentCourseParticipation).toHaveBeenCalledWith(
          userToken,
          courseParticipation,
          referral.id,
          undefined,
          {
            change: false,
            remove: false,
          },
        )
        expect(personService.getPerson).toHaveBeenCalledWith(username, referral.prisonNumber)
        expect(response.render).toHaveBeenCalledWith('referrals/show/programmeHistoryDetail', {
          backLinkHref: referPaths.new.programmeHistory.index({ referralId: referral.id }),
          hideTitleServiceName: true,
          pageHeading: 'Programme history details',
          person,
          referralId: referral.id,
          summaryListOptions,
        })
      })

      describe('but the participation and referral are not for the same person', () => {
        it('redirects to the correct path', async () => {
          const anotherPerson = personFactory.build()
          const anotherReferral = referralFactory.build({ prisonNumber: anotherPerson.prisonNumber })

          referralService.getReferral.mockResolvedValue(anotherReferral)

          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(
            referPaths.new.programmeHistory.index({ referralId: referral.id }),
          )
        })
      })
    })

    describe('when the request is for an existing referral', () => {
      describe('and on the assess path', () => {
        beforeEach(() => {
          request = buildRequest(
            assessPaths.show.programmeHistoryDetail({
              courseParticipationId: courseParticipation.id,
              referralId: referral.id,
            }),
          )
        })

        it('renders the show programme history detail template with the correct response locals', async () => {
          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(
            'referrals/show/programmeHistoryDetail',
            expect.objectContaining({
              backLinkHref: `${assess.show.programmeHistory({ referralId: referral.id })}#content`,
            }),
          )
        })

        describe('but the participation and referral are not for the same person', () => {
          it('redirects to the correct path', async () => {
            const anotherPerson = personFactory.build()
            const anotherReferral = referralFactory.build({ prisonNumber: anotherPerson.prisonNumber })

            referralService.getReferral.mockResolvedValue(anotherReferral)

            const requestHandler = controller.show()
            await requestHandler(request, response, next)

            expect(response.redirect).toHaveBeenCalledWith(
              `${assessPaths.show.programmeHistory({ referralId: referral.id })}#content`,
            )
          })
        })
      })

      describe('and on the refer path', () => {
        beforeEach(() => {
          request = buildRequest(
            referPaths.show.programmeHistoryDetail({
              courseParticipationId: courseParticipation.id,
              referralId: referral.id,
            }),
          )
        })

        it('renders the show programme history detail template with the correct response locals', async () => {
          const requestHandler = controller.show()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(
            'referrals/show/programmeHistoryDetail',
            expect.objectContaining({
              backLinkHref: `${refer.show.programmeHistory({ referralId: referral.id })}#content`,
            }),
          )
        })

        describe('but the participation and referral are not for the same person', () => {
          it('redirects to the correct path', async () => {
            const anotherPerson = personFactory.build()
            const anotherReferral = referralFactory.build({ prisonNumber: anotherPerson.prisonNumber })

            referralService.getReferral.mockResolvedValue(anotherReferral)

            const requestHandler = controller.show()
            await requestHandler(request, response, next)

            expect(response.redirect).toHaveBeenCalledWith(
              `${referPaths.show.programmeHistory({ referralId: referral.id })}#content`,
            )
          })
        })
      })
    })
  })
})
