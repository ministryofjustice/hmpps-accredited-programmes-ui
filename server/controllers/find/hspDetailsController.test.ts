import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import HspDetailsController from './hspDetailsController'
import { findPaths } from '../../paths'
import type { CourseService, PersonService, ReferenceDataService } from '../../services'
import { courseFactory, personFactory, sexualOffenceDetailsFactory } from '../../testutils/factories'
import { CourseUtils, FormUtils, ReferenceDataUtils } from '../../utils'

jest.mock('../../utils/formUtils')

describe('HspDetailsController', () => {
  const username = 'SOME_USER'
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const courseService = createMock<CourseService>({})
  const personService = createMock<PersonService>({})
  const referenceDataService = createMock<ReferenceDataService>({})

  let controller: HspDetailsController

  const hspCourse = courseFactory.build({ name: 'Healthy Sex Programme' })
  const person = personFactory.build({ name: 'Del Hatton' })
  const selectedOffenceDetails = ['ABC-123']

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId: hspCourse.id },
      session: {
        hspReferralData: {
          selectedOffenceDetails,
        },
        pniFindAndReferData: {
          prisonNumber: person.prisonNumber,
          programmePathway: 'HIGH_INTENSITY_BC',
        },
      },
      user: { username },
    })

    response = createMock<Response>({})
    controller = new HspDetailsController(courseService, personService, referenceDataService)

    when(courseService.getCourse).calledWith(username, hspCourse.id).mockResolvedValue(hspCourse)
    when(personService.getPerson).calledWith(username, person.prisonNumber).mockResolvedValue(person)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('show', () => {
    const sexualOffenceDetails = sexualOffenceDetailsFactory.buildList(3)
    const mockGroupedDetailOptions = {
      'Category 1': [
        { categoryDescription: 'Category 1', description: 'Option 1', hintText: 'Hint 1', id: 'ABC-123', score: 1 },
        { categoryDescription: 'Category 1', description: 'Option 2', hintText: 'Hint 2', id: 'ABC-456', score: 2 },
      ],
      'Category 2': [
        { categoryDescription: 'Category 2', description: 'Option 3', hintText: 'Hint 3', id: 'ABC-789', score: 3 },
      ],
    }
    const mockFieldsets = [
      {
        checkboxes: [
          { checked: false, hint: { text: 'Hint 1' }, text: 'Option 1', value: 'ABC-123::1' },
          { checked: false, hint: { text: 'Hint 2' }, text: 'Option 2', value: 'ABC-456::2' },
        ],
        legend: { text: 'Category 1' },
      },
      {
        checkboxes: [{ checked: false, hint: { text: 'Hint 3' }, text: 'Option 3', value: 'ABC-789::3' }],
        legend: { text: 'Category 2' },
      },
    ]

    beforeEach(() => {
      when(referenceDataService.getSexualOffenceDetails).calledWith(username).mockResolvedValue(sexualOffenceDetails)

      jest.spyOn(ReferenceDataUtils, 'groupOptionsByKey').mockReturnValue(mockGroupedDetailOptions)
      jest.spyOn(ReferenceDataUtils, 'createSexualOffenceDetailsFieldset').mockReturnValue(mockFieldsets)
    })

    it('should render the HSP details page with the correct data', async () => {
      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(FormUtils.setFieldErrors).toHaveBeenCalledWith(request, response, ['sexualOffenceDetails'])
      expect(ReferenceDataUtils.groupOptionsByKey).toHaveBeenCalledWith(sexualOffenceDetails, 'categoryDescription')
      expect(ReferenceDataUtils.createSexualOffenceDetailsFieldset).toHaveBeenCalledWith(
        mockGroupedDetailOptions,
        selectedOffenceDetails,
      )
      expect(response.render).toHaveBeenCalledWith('courses/hsp/details/show', {
        checkboxFieldsets: mockFieldsets,
        hrefs: {
          back: findPaths.show({ courseId: hspCourse.id }),
          programmeIndex: findPaths.pniFind.recommendedProgrammes({}),
        },
        pageHeading: 'Sexual offence details',
        personName: person.name,
      })
    })

    describe('when there is no `prisonNumber` in `session.pniFindAndReferData`', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.prisonNumber

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when there is no `programmePathway` in `session.pniFindAndReferData`', () => {
      it('should redirect to the person search page', async () => {
        delete request.session.pniFindAndReferData?.programmePathway

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })

    describe('when the course is not an HSP course', () => {
      it('should redirect to the person search page', async () => {
        jest.spyOn(CourseUtils, 'isHsp').mockReturnValue(false)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch.pattern)
      })
    })
  })

  describe('submit', () => {
    describe('when the total score of the submitted selections meets the threshold of 3', () => {
      it('should return that thy are eligible for HSP', async () => {
        request.body = { sexualOffenceDetails: ['ABC-123::1', 'ABC-456::2'] }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.hspReferralData).toEqual({
          selectedOffenceDetails: ['ABC-123', 'ABC-456'],
          totalScore: 3,
        })
        expect(response.send).toHaveBeenCalledWith('Eligible')
      })
    })

    describe('when the total score of the submitted selections does not meet the threshold of 3', () => {
      it('should redirect to the HSP not eligible path', async () => {
        request.body = { sexualOffenceDetails: 'ABC-123::1' }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.session.hspReferralData).toEqual({
          selectedOffenceDetails: ['ABC-123'],
          totalScore: 1,
        })
        expect(response.redirect).toHaveBeenCalledWith(findPaths.hsp.notEligible.show({ courseId: hspCourse.id }))
      })
    })

    describe('when no sexual offence has been selected', () => {
      it('should redirect to the HSP details page with an error message', async () => {
        request.body = { sexualOffenceDetails: undefined }

        const requestHandler = controller.submit()
        await requestHandler(request, response, next)

        expect(request.flash).toHaveBeenCalledWith(
          'sexualOffenceDetailsError',
          'Please select at least one sexual offence',
        )
        expect(response.redirect).toHaveBeenCalledWith(findPaths.hsp.details.show({ courseId: hspCourse.id }))
      })
    })
  })
})
