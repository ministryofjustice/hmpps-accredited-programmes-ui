import { type DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import HspDetailsController from './hspDetailsController'
import { findPaths } from '../../paths'
import type { CourseService, PersonService, ReferenceDataService } from '../../services'
import { courseFactory, personFactory, sexualOffenceDetailsFactory } from '../../testutils/factories'
import { CourseUtils, ReferenceDataUtils } from '../../utils'

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

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId: hspCourse.id },
      session: {
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

      expect(ReferenceDataUtils.groupOptionsByKey).toHaveBeenCalledWith(sexualOffenceDetails, 'categoryDescription')
      expect(ReferenceDataUtils.createSexualOffenceDetailsFieldset).toHaveBeenCalledWith(mockGroupedDetailOptions, [])
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
})
