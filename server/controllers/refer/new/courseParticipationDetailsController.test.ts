import { faker } from '@faker-js/faker'
import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import NewReferralsCourseParticipationDetailsController from './courseParticipationDetailsController'
import { referPaths } from '../../../paths'
import type { CourseService, PersonService, ReferralService } from '../../../services'
import { courseParticipationFactory, personFactory, referralFactory } from '../../../testutils/factories'
import Helpers from '../../../testutils/helpers'
import { CourseParticipationUtils, FormUtils } from '../../../utils'
import type {
  CourseParticipation,
  CourseParticipationSetting,
  CourseParticipationUpdate,
} from '@accredited-programmes-api'

jest.mock('../../../utils/formUtils')
jest.mock('../../../utils/courseParticipationUtils')

describe('NewReferralsCourseParticipationDetailsController', () => {
  const username = 'SOME_USERNAME'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referralService = createMock<ReferralService>({})

  const courseParticipationId = faker.string.uuid()
  const courseParticipation = courseParticipationFactory.new().build()

  const referralId = faker.string.uuid()
  const draftReferral = referralFactory.started().build({ id: referralId })
  const submittedReferral = referralFactory.submitted().build({ id: referralId })

  let controller: NewReferralsCourseParticipationDetailsController

  beforeEach(() => {
    request = createMock<Request>({
      params: {
        courseParticipationId,
        referralId,
      },
      user: { username },
    })
    response = Helpers.createMockResponseWithCaseloads()

    controller = new NewReferralsCourseParticipationDetailsController(courseService, personService, referralService)

    courseService.getParticipation.mockResolvedValue(courseParticipation)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('renders the details show page and calls `FormUtils.setFieldErrors` and `FormUtils.setFormValues` with the correct param values', async () => {
      referralService.getReferral.mockResolvedValue(draftReferral)

      const person = personFactory.build()
      personService.getPerson.mockResolvedValue(person)

      const emptyErrorsLocal = { list: [], messages: {} }
      ;(FormUtils.setFieldErrors as jest.Mock).mockImplementation((_request, _response, _fields) => {
        response.locals.errors = emptyErrorsLocal
      })
      ;(FormUtils.setFormValues as jest.Mock).mockImplementation((_request, _response) => {
        response.locals.formValues = {}
      })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('referrals/new/courseParticipations/details/show', {
        action: `${referPaths.new.programmeHistory.details.update({ courseParticipationId, referralId })}?_method=PUT`,
        backLinkHref: referPaths.new.programmeHistory.editProgramme({ courseParticipationId, referralId }),
        courseParticipationId,
        hideTitleServiceName: true,
        pageHeading: 'Add Accredited Programme details',
        person,
        referralId,
      })
      expect(personService.getPerson).toHaveBeenCalledWith(username, draftReferral.prisonNumber)
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
          referralService.getReferral.mockResolvedValue(draftReferral)

          const courseParticipationWithCommunitySetting = courseParticipationFactory.build({
            setting: { location: 'Somewhere', type: 'community' },
          }) as CourseParticipation & { setting: CourseParticipationSetting }

          courseService.getParticipation.mockResolvedValue(courseParticipationWithCommunitySetting)

          const requestHandler = controller.show()
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
          referralService.getReferral.mockResolvedValue(draftReferral)

          const courseParticipationWithCustodySetting = courseParticipationFactory.build({
            setting: { location: 'Somewhere', type: 'custody' },
          }) as CourseParticipation & { setting: CourseParticipationSetting }

          courseService.getParticipation.mockResolvedValue(courseParticipationWithCustodySetting)

          const requestHandler = controller.show()
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

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })
  })

  describe('update', () => {
    describe('when all the submitted data is valid', () => {
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

      beforeEach(() => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        ;(CourseParticipationUtils.processDetailsFormData as jest.Mock).mockImplementation(_request => {
          return {
            courseParticipationUpdate,
            hasFormErrors: false,
          }
        })
      })

      it('asks the service to update the given course participation details and redirects to the `NewReferralsCourseParticipationsController` `index` action', async () => {
        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(courseService.getParticipation).toHaveBeenCalledWith(username, courseParticipationId)
        expect(CourseParticipationUtils.processDetailsFormData).toHaveBeenCalledWith(
          request,
          courseParticipation.courseName,
        )
        expect(courseService.updateParticipation).toHaveBeenCalledWith(
          username,
          courseParticipationId,
          courseParticipationUpdate,
        )
        expect(request.flash).toHaveBeenCalledWith('successMessage', 'You have successfully updated a programme.')
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.programmeHistory.index({ referralId }))
      })

      describe('when the `req.session.returnTo` is `check-answers`', () => {
        it('redirects to the check answers page with #programmeHistory', async () => {
          request.session.returnTo = 'check-answers'

          const requestHandler = controller.update()
          await requestHandler(request, response, next)

          expect(response.redirect).toHaveBeenCalledWith(
            `${referPaths.new.checkAnswers({ referralId })}#programmeHistory`,
          )
        })
      })
    })

    describe('when the referral has been submitted', () => {
      it('redirects to the referral confirmation action', async () => {
        referralService.getReferral.mockResolvedValue(submittedReferral)

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(response.redirect).toHaveBeenCalledWith(referPaths.new.complete({ referralId }))
      })
    })

    describe('when the form has errors', () => {
      it('redirects back to the `show` action', async () => {
        referralService.getReferral.mockResolvedValue(draftReferral)
        ;(CourseParticipationUtils.processDetailsFormData as jest.Mock).mockImplementation(_request => {
          return { hasFormErrors: true }
        })

        const requestHandler = controller.update()
        await requestHandler(request, response, next)

        expect(referralService.getReferral).toHaveBeenCalledWith(username, referralId)
        expect(courseService.getParticipation).toHaveBeenCalledWith(username, courseParticipationId)
        expect(CourseParticipationUtils.processDetailsFormData).toHaveBeenCalledWith(
          request,
          courseParticipation.courseName,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          referPaths.new.programmeHistory.details.show({ courseParticipationId, referralId }),
        )
      })
    })
  })
})
