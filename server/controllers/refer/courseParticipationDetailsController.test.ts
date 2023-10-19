import { faker } from '@faker-js/faker'
import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import CourseParticipationDetailsController from './courseParticipationDetailsController'
import { referPaths } from '../../paths'
import type { CourseService, PersonService, ReferralService } from '../../services'
import { courseParticipationFactory, personFactory, referralFactory } from '../../testutils/factories'
import Helpers from '../../testutils/helpers'
import { CourseParticipationUtils, FormUtils, ReferralUtils } from '../../utils'
import type {
  CourseParticipation,
  CourseParticipationSetting,
  CourseParticipationUpdate,
} from '@accredited-programmes/models'

jest.mock('../../utils/courseParticipationUtils')
jest.mock('../../utils/formUtils')
jest.mock('../../utils/referralUtils')

describe('CourseParticipationDetailsController', () => {
  const token = 'SOME_TOKEN'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const courseParticipationId = faker.string.uuid()
  const referralId = faker.string.uuid()

  const referral = referralFactory.build({ id: referralId })
  const courseParticipation = courseParticipationFactory.new().build()

  let courseParticipationDetailsController: CourseParticipationDetailsController

  beforeEach(() => {
    request = createMock<Request>({
      params: {
        courseParticipationId,
        referralId,
      },
      user: { token },
    })
    response = Helpers.createMockResponseWithCaseloads()

    courseParticipationDetailsController = new CourseParticipationDetailsController(
      courseService,
      personService,
      referralService,
    )

    referralService.getReferral.mockResolvedValue(referral)
    courseService.getParticipation.mockResolvedValue(courseParticipation)
    ;(ReferralUtils.redirectIfSubmitted as jest.Mock).mockImplementation((_referral, _response) => {
      // Do nothing
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the details show page and calls `FormUtils.setFieldErrors` and `FormUtils.setFormValues` with the correct param values', async () => {
      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })
      ;(FormUtils.setFormValues as jest.Mock).mockImplementation((_request, _response) => {
        response.locals.formValues = {}
      })

      const requestHandler = courseParticipationDetailsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/courseParticipations/details/show', {
        action: `${referPaths.programmeHistory.details.update({ courseParticipationId, referralId })}?_method=PUT`,
        backLinkHref: referPaths.programmeHistory.editProgramme({ courseParticipationId, referralId }),
        courseParticipationId,
        pageHeading: 'Add Accredited Programme details',
        person,
        referralId,
      })
      expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['yearCompleted', 'yearStarted'])
      expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, {
        detail: courseParticipation.detail,
        outcome: courseParticipation.outcome,
        setting: {
          ...courseParticipation.setting,
          communityLocation: '',
          custodyLocation: '',
        },
        source: courseParticipation.source,
      })
    })

    describe('when the course participation has existing data', () => {
      describe('and has a `setting.type` of `community` and a `setting.location`', () => {
        it('calls `FormUtils.setFormValues` with the correct `defaultValues` param values', async () => {
          const courseParticipationWithCommunitySetting = courseParticipationFactory.build({
            setting: { location: 'Somewhere', type: 'community' },
          }) as CourseParticipation & { setting: CourseParticipationSetting }

          courseService.getParticipation.mockResolvedValue(courseParticipationWithCommunitySetting)

          const requestHandler = courseParticipationDetailsController.show()
          await requestHandler(request, response, next)

          expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, {
            detail: courseParticipationWithCommunitySetting.detail,
            outcome: courseParticipationWithCommunitySetting.outcome,
            setting: {
              ...courseParticipationWithCommunitySetting.setting,
              communityLocation: courseParticipationWithCommunitySetting.setting.location,
              custodyLocation: '',
            },
            source: courseParticipationWithCommunitySetting.source,
          })
        })
      })

      describe('and has a `setting.type` of `custody` and a `setting.location`', () => {
        it('calls `FormUtils.setFormValues` with the correct `defaultValues` param values', async () => {
          const courseParticipationWithCustodySetting = courseParticipationFactory.build({
            setting: { location: 'Somewhere', type: 'custody' },
          }) as CourseParticipation & { setting: CourseParticipationSetting }

          courseService.getParticipation.mockResolvedValue(courseParticipationWithCustodySetting)

          const requestHandler = courseParticipationDetailsController.show()
          await requestHandler(request, response, next)

          expect(FormUtils.setFormValues).toHaveBeenCalledWith(request, response, {
            detail: courseParticipationWithCustodySetting.detail,
            outcome: courseParticipationWithCustodySetting.outcome,
            setting: {
              ...courseParticipationWithCustodySetting.setting,
              communityLocation: '',
              custodyLocation: courseParticipationWithCustodySetting.setting.location,
            },
            source: courseParticipationWithCustodySetting.source,
          })
        })
      })
    })
  })

  describe('update', () => {
    it('asks the service to update the given course participation details and redirects to the `CourseParticipationsController` `index` action', async () => {
      const courseParticipationUpdate: CourseParticipationUpdate = {
        courseName: courseParticipation.courseName,
        detail: 'Some additional detail',
        outcome: {
          status: 'complete',
          yearCompleted: 2019,
        },
        setting: {
          location: 'Somewhere',
          type: 'community',
        },
        source: 'The source',
      }

      ;(CourseParticipationUtils.processDetailsFormData as jest.Mock).mockImplementation(_request => {
        return {
          courseParticipationUpdate,
          hasFormErrors: false,
        }
      })

      const requestHandler = courseParticipationDetailsController.update()
      await requestHandler(request, response, next)

      expect(referralService.getReferral).toHaveBeenCalledWith(token, referralId)
      expect(ReferralUtils.redirectIfSubmitted).toHaveBeenCalledWith(referral, response)
      expect(courseService.getParticipation).toHaveBeenCalledWith(token, courseParticipationId)
      expect(CourseParticipationUtils.processDetailsFormData).toHaveBeenCalledWith(
        request,
        courseParticipation.courseName,
      )
      expect(courseService.updateParticipation).toHaveBeenCalledWith(
        token,
        courseParticipationId,
        courseParticipationUpdate,
      )
      expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully updated a programme.')
      expect(response.redirect).toHaveBeenCalledWith(referPaths.programmeHistory.index({ referralId }))
    })

    describe('when the form has errors', () => {
      it('redirects back to the `show` action', async () => {
        ;(CourseParticipationUtils.processDetailsFormData as jest.Mock).mockImplementation(_request => {
          return { hasFormErrors: true }
        })

        const requestHandler = courseParticipationDetailsController.update()
        await requestHandler(request, response, next)

        expect(courseService.getParticipation).toHaveBeenCalledWith(token, courseParticipationId)
        expect(CourseParticipationUtils.processDetailsFormData).toHaveBeenCalledWith(
          request,
          courseParticipation.courseName,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.programmeHistory.details.show({ courseParticipationId, referralId }),
        )
      })
    })
  })
})
