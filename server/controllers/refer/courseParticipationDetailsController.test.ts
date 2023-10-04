import { faker } from '@faker-js/faker'
import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseParticipationDetailsController from './courseParticipationDetailsController'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { courseParticipationFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'

describe('CourseParticipationDetailsController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  let courseParticipationDetailsController: CourseParticipationDetailsController

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
    response = Helpers.createMockResponseWithCaseloads()
    courseParticipationDetailsController = new CourseParticipationDetailsController(
      courseService,
      personService,
      referralService,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    const courseParticipationId = faker.string.uuid()
    const referralId = faker.string.uuid()
    const referral = referralFactory.build({ id: referralId })

    beforeEach(() => {
      request.params.courseParticipationId = courseParticipationId
      request.params.referralId = referralId

      referralService.getReferral.mockResolvedValue(referral)
    })

    it('renders the update details form page for a course participation', async () => {
      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const courseParticipation = courseParticipationFactory.build()
      courseService.getParticipation.mockResolvedValue(courseParticipation)

      const requestHandler = courseParticipationDetailsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/details/show', {
        courseParticipationId,
        pageHeading: 'Add Accredited Programme details',
        person,
        referralId,
      })
    })
  })
})
