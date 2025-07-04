import type { DeepMocked } from '@golevelup/ts-jest'
import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { when } from 'jest-when'

import BuildingChoicesController from './buildingChoicesController'
import { findPaths } from '../../paths'
import type { CourseService, OrganisationService } from '../../services'
import { courseFactory, courseOfferingFactory, organisationFactory } from '../../testutils/factories'
import { CourseUtils, OrganisationUtils } from '../../utils'
import type { BuildingChoicesData } from '@accredited-programmes/ui'
import type { GovukFrontendTableRow } from '@govuk-frontend'

jest.mock('../../utils/courseUtils')
jest.mock('../../utils/formUtils')
jest.mock('../../utils/organisationUtils')

const mockedCourse = CourseUtils as jest.Mocked<typeof CourseUtils>
const mockedOrganisationUtils = OrganisationUtils as jest.Mocked<typeof OrganisationUtils>

describe('BuildingChoicesFormController', () => {
  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let buildingChoicesData: BuildingChoicesData
  const courseService = createMock<CourseService>({})
  const organisationService = createMock<OrganisationService>({})
  let controller: BuildingChoicesController

  const username = 'SOME_USERNAME'
  const courseId = 'A_COURSE_ID'

  beforeEach(() => {
    request = createMock<Request>({
      params: { courseId },
      session: { buildingChoicesData },
      user: { username },
    })
    response = createMock<Response>({})
    controller = new BuildingChoicesController(courseService, organisationService)
  })

  describe('show', () => {
    describe('when the form data is not present in the session', () => {
      it('should redirect to the find index page', async () => {
        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(findPaths.pniFind.personSearch({}))
      })
    })

    describe('when the form data is present in the session', () => {
      const organisationsTableData: Array<GovukFrontendTableRow> = [
        [
          {
            attributes: {
              'data-sort-value': 'HMP Prison A',
            },
            html: '<a href="/offerings/123">HMP Prison A</a>',
          },
          { text: 'Category A' },
          { text: 'London' },
        ],
        [
          {
            attributes: {
              'data-sort-value': 'HMP Prison B',
            },
            html: '<a href="/offerings/456">HMP Prison B</a>',
          },
          { text: 'Category B' },
          { text: 'Manchester' },
        ],
      ]
      const buildingChoicesAnswersSummaryListRows = [
        { key: { text: 'Convicted of a sexual offence' }, value: { text: 'No' } },
        { key: { text: 'In a women’s prison' }, value: { text: 'Yes' } },
      ]

      beforeEach(() => {
        buildingChoicesData = {
          courseVariantId: 'bc-course-id',
          isConvictedOfSexualOffence: 'no',
          isInAWomensPrison: 'yes',
        }
        request.session.buildingChoicesData = buildingChoicesData

        mockedCourse.buildingChoicesAnswersSummaryListRows.mockReturnValue(buildingChoicesAnswersSummaryListRows)
        mockedOrganisationUtils.organisationTableRows.mockReturnValue(organisationsTableData)
      })

      it('should render the buildingChoices/show template', async () => {
        const organisations = organisationFactory.buildList(3)
        organisationService.getOrganisations.mockResolvedValue(organisations)

        const courseOfferings = organisations.map(organisation =>
          courseOfferingFactory.build({ organisationId: organisation.id, withdrawn: false }),
        )
        const returnedCourses = [courseFactory.build({ courseOfferings })]

        when(courseService.getBuildingChoicesVariants)
          .calledWith(username, courseId, buildingChoicesData)
          .mockResolvedValue(returnedCourses)

        const requestHandler = controller.show()
        await requestHandler(request, response, next)

        const course = returnedCourses[0]

        expect(CourseUtils.buildingChoicesAnswersSummaryListRows).toHaveBeenCalledWith(buildingChoicesData)
        expect(OrganisationUtils.organisationTableRows).toHaveBeenCalledWith(
          organisations.map((organisation, index) => ({
            ...organisation,
            courseOfferingId: courseOfferings[index].id,
            withdrawn: courseOfferings[index].withdrawn,
          })),
        )
        expect(response.render).toHaveBeenCalledWith('courses/buildingChoices/show', {
          buildingChoicesAnswersSummaryListRows,
          course,
          hideTitleServiceName: true,
          hrefs: {
            addOffering: findPaths.offerings.add.create({ courseId }),
            back: findPaths.buildingChoices.form.show({ courseId }),
            updateProgramme: findPaths.course.update.show({ courseId: course.id }),
          },
          organisationsTableData,
          pageHeading: course.displayName,
          pageTitleOverride: `${course.displayName} programme description`,
        })
      })
    })
  })
})
