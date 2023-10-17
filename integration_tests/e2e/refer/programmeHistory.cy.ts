import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  userFactory,
} from '../../../server/testutils/factories'
import { type CourseParticipationDetailsBody, OrganisationUtils } from '../../../server/utils'
import Page from '../../pages/page'
import {
  DeleteProgrammeHistoryPage,
  ProgrammeHistoryDetailsPage,
  ProgrammeHistoryPage,
  SelectProgrammePage,
  TaskListPage,
} from '../../pages/refer'
import type { CourseParticipation } from '@accredited-programmes/models'
import type { CourseParticipationPresenter } from '@accredited-programmes/ui'

context('Programme history', () => {
  const prisoner = prisonerFactory.build({
    firstName: 'Del',
    lastName: 'Hatton',
  })
  const person = personFactory.build({
    currentPrison: prisoner.prisonName,
    name: 'Del Hatton',
    prisonNumber: prisoner.prisonerNumber,
  })
  const user1 = userFactory.build()
  const user2 = userFactory.build()
  const courses = courseFactory.buildList(4)
  const courseParticipationWithCourseId = courseParticipationFactory.withCourseId().build({
    addedBy: user1.username,
    courseId: courses[0].id,
    createdAt: '2023-01-01T12:00:00.000Z',
    prisonNumber: person.prisonNumber,
  })
  const presentedCourseParticipationWithCourseId = {
    ...courseParticipationWithCourseId,
    addedByName: user1.name,
    name: courses[0].name,
  }
  const courseParticipationWithOtherCourseName = courseParticipationFactory.withOtherCourseName().build({
    addedBy: user2.username,
    createdAt: '2022-01-01T12:00:00.000Z',
    otherCourseName: 'A great course name',
    prisonNumber: person.prisonNumber,
  })
  const presentedCourseParticipationWithOtherCourseName = {
    ...courseParticipationWithOtherCourseName,
    addedByName: user2.name,
    name: courseParticipationWithOtherCourseName.otherCourseName as CourseParticipationPresenter['name'],
  }
  const courseOffering = courseOfferingFactory.build()
  const referral = referralFactory.started().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubUserDetails', { user: user1 })
    cy.task('stubUserDetails', { user: user2 })
  })

  describe('Showing the programme history page', () => {
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)

    const courseParticipations = [courseParticipationWithCourseId, courseParticipationWithOtherCourseName]
    const presentedCourseParticipations: Array<CourseParticipationPresenter> = [
      presentedCourseParticipationWithCourseId,
      presentedCourseParticipationWithOtherCourseName,
    ]

    const path = referPaths.programmeHistory.index({ referralId: referral.id })

    beforeEach(() => {
      cy.task('stubCourse', courses[0])
    })

    describe('when there is an existing programme history', () => {
      beforeEach(() => {
        cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })

        cy.visit(path)
      })

      it('shows the page with an existing programme history', () => {
        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          participations: presentedCourseParticipations,
          person,
          referral,
        })
        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainNavigation(path)
        programmeHistoryPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
        programmeHistoryPage.shouldNotContainSuccessMessage()
        programmeHistoryPage.shouldContainPreHistoryParagraph()
        programmeHistoryPage.shouldContainHistorySummaryCards(presentedCourseParticipations, referral.id)
        programmeHistoryPage.shouldContainButton('Continue')
        programmeHistoryPage.shouldContainButtonLink(
          'Add another',
          referPaths.programmeHistory.new({ referralId: referral.id }),
        )
      })

      describe('and the programme history has been reviewed', () => {
        beforeEach(() => {
          cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })
          cy.task('stubOffering', { courseId: courses[0].id, courseOffering })
          cy.task('stubPrison', prison)
          cy.task('stubUpdateReferral', referral.id)
        })

        it('updates the referral and redirects to the task list', () => {
          const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
            participations: presentedCourseParticipations,
            person,
            referral,
          })
          programmeHistoryPage.reviewProgrammeHistory()

          const taskListPage = Page.verifyOnPage(TaskListPage, {
            course: courses[0],
            courseOffering,
            organisation,
            referral,
          })
          taskListPage.shouldHaveReviewedProgrammeHistory()
        })
      })
    })

    describe('when there is no existing programme history', () => {
      const emptyCourseParticipations: Array<CourseParticipation> = []

      beforeEach(() => {
        cy.task('stubParticipationsByPerson', {
          courseParticipations: emptyCourseParticipations,
          prisonNumber: prisoner.prisonerNumber,
        })

        cy.visit(path)
      })

      it('shows the page without an existing programme history', () => {
        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          participations: emptyCourseParticipations as Array<CourseParticipationPresenter>,
          person,
          referral,
        })
        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainNavigation(path)
        programmeHistoryPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
        programmeHistoryPage.shouldNotContainSuccessMessage()
        programmeHistoryPage.shouldContainNoHistoryHeading()
        programmeHistoryPage.shouldContainNoHistoryParagraph()
        programmeHistoryPage.shouldContainButton('Continue')
        programmeHistoryPage.shouldContainButtonLink(
          'Add a programme',
          referPaths.programmeHistory.new({ referralId: referral.id }),
        )
      })

      describe('and the programme history has been reviewed', () => {
        beforeEach(() => {
          cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })
          cy.task('stubOffering', { courseId: courses[0].id, courseOffering })
          cy.task('stubPrison', prison)
          cy.task('stubUpdateReferral', referral.id)
        })

        it('updates the referral and redirects to the task list', () => {
          const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
            participations: presentedCourseParticipations,
            person,
            referral,
          })
          programmeHistoryPage.reviewProgrammeHistory()

          const taskListPage = Page.verifyOnPage(TaskListPage, {
            course: courses[0],
            courseOffering,
            organisation,
            referral,
          })
          taskListPage.shouldHaveReviewedProgrammeHistory()
        })
      })
    })
  })

  describe('When adding to the programme history', () => {
    describe('and selecting a programme', () => {
      beforeEach(() => {
        cy.task('stubCourses', courses)
      })

      describe('for a new entry', () => {
        const path = referPaths.programmeHistory.new({ referralId: referral.id })

        beforeEach(() => {
          cy.visit(path)
        })

        it('shows the select programme page', () => {
          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainNavigation(path)
          selectProgrammePage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldNotDisplayOtherCourseInput()
          selectProgrammePage.shouldDisplayOtherCourseInput()
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('creates the new entry and redirects to the details page', () => {
          cy.task('stubCreateParticipation', courseParticipationWithCourseId)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(courses[0].id)
          selectProgrammePage.submitSelection(courseParticipationWithCourseId, courses[0].id)

          Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: courseParticipationWithCourseId,
            person,
          })
        })

        it('displays an error when no programme is selected', () => {
          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePageWithError.shouldHaveErrors([
            {
              field: 'courseId',
              message: 'Select a programme',
            },
          ])
        })

        it('displays an error when "Other" is selected but a programme name is not provided', () => {
          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse('other')
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePageWithError.shouldHaveErrors([
            {
              field: 'otherCourseName',
              message: 'Enter the programme name',
            },
          ])
        })
      })

      describe('for an existing entry', () => {
        const courseParticipationWithCourseIdPath = referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithCourseId.id,
          referralId: referral.id,
        })
        const courseParticipationWithOtherCourseNamePath = referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithOtherCourseName.id,
          referralId: referral.id,
        })

        it('shows the select programme page for a history with a known programme', () => {
          cy.task('stubParticipation', courseParticipationWithCourseId)

          cy.visit(courseParticipationWithCourseIdPath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainNavigation(courseParticipationWithCourseIdPath)
          selectProgrammePage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldHaveSelectedCourse(courseParticipationWithCourseId.courseId)
          selectProgrammePage.shouldNotDisplayOtherCourseInput()
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('shows the select programme page for a history with an other programme', () => {
          cy.task('stubParticipation', courseParticipationWithOtherCourseName)

          cy.visit(courseParticipationWithOtherCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainNavigation(courseParticipationWithOtherCourseNamePath)
          selectProgrammePage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldDisplayOtherCourseInput()
          selectProgrammePage.shouldHaveSelectedCourse('other', courseParticipationWithOtherCourseName.otherCourseName)
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('updates the entry and redirects to the details page', () => {
          const newCourseId = courses[2].id
          const updatedParticipation = { ...courseParticipationWithCourseId, courseId: newCourseId }

          cy.task('stubParticipation', courseParticipationWithCourseId)
          cy.task('stubUpdateParticipation', updatedParticipation)

          cy.visit(courseParticipationWithCourseIdPath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(newCourseId)
          selectProgrammePage.submitSelection(courseParticipationWithCourseId, newCourseId)

          Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: updatedParticipation,
            person,
          })
        })

        it('displays an error when "Other" is selected but a programme name is not provided', () => {
          cy.task('stubParticipation', courseParticipationWithCourseId)

          cy.visit(courseParticipationWithCourseIdPath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse('other')
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePageWithError.shouldHaveErrors([
            {
              field: 'otherCourseName',
              message: 'Enter the programme name',
            },
          ])
        })
      })
    })

    describe('and adding details', () => {
      const newCourseParticipation = courseParticipationFactory.new().build({
        addedBy: user1.username,
        courseId: courses[0].id,
        otherCourseName: undefined,
        prisonNumber: person.prisonNumber,
      })
      const newCourseParticipationPath = referPaths.programmeHistory.details.show({
        courseParticipationId: newCourseParticipation.id,
        referralId: referral.id,
      })

      it('shows the details page', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationPath)

        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.shouldContainNavigation(newCourseParticipationPath)
        programmeHistoryDetailsPage.shouldHavePersonDetails(person)
        programmeHistoryDetailsPage.shouldContainBackLink(
          referPaths.programmeHistory.editProgramme({
            courseParticipationId: newCourseParticipation.id,
            referralId: referral.id,
          }),
        )
        programmeHistoryDetailsPage.shouldHaveCorrectFormValues()
        programmeHistoryDetailsPage.shouldContainSettingRadioItems()
        programmeHistoryDetailsPage.shouldNotDisplayCommunityLocationInput()
        programmeHistoryDetailsPage.shouldDisplayCommunityLocationInput()
        programmeHistoryDetailsPage.shouldNotDisplayCustodyLocationInput()
        programmeHistoryDetailsPage.shouldDisplayCustodyLocationInput()
        programmeHistoryDetailsPage.shouldContainOutcomeRadioItems()
        programmeHistoryDetailsPage.shouldNotDisplayYearCompletedInput()
        programmeHistoryDetailsPage.shouldDisplayYearCompletedInput()
        programmeHistoryDetailsPage.shouldNotDisplayYearStartedInput()
        programmeHistoryDetailsPage.shouldDisplayYearStartedInput()
        programmeHistoryDetailsPage.shouldContainDetailTextArea()
        programmeHistoryDetailsPage.shouldContainSourceTextArea()
        programmeHistoryDetailsPage.shouldContainButton('Continue')
      })

      it('updates the entry and redirects to the programme history page', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationPath)

        const formValues: CourseParticipationDetailsBody = {
          detail: 'Some outcome details',
          outcome: {
            status: 'complete',
            yearCompleted: '2023',
            yearStarted: '',
          },
          setting: {
            communityLocation: 'A community location',
            custodyLocation: '',
            type: 'community',
          },
          source: 'The source',
        }
        const updatedCourseParticipation = courseParticipationFactory.build({
          ...newCourseParticipation,
          detail: formValues.detail,
          outcome: {
            status: formValues.outcome.status,
            yearCompleted: Number(formValues.outcome),
          },
          setting: {
            location: formValues.setting.communityLocation,
            type: formValues.setting.type,
          },
          source: formValues.source,
        })

        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: updatedCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.selectSetting(formValues.setting.type as string)
        programmeHistoryDetailsPage.inputCommunityLocation(formValues.setting.communityLocation)
        programmeHistoryDetailsPage.selectOutcome(formValues.outcome.status as string)
        programmeHistoryDetailsPage.inputOutcomeYearCompleted(formValues.outcome.yearCompleted)
        programmeHistoryDetailsPage.inputDetail(formValues.detail)
        programmeHistoryDetailsPage.inputSource(formValues.source)
        programmeHistoryDetailsPage.submitDetails()

        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          participations: [{ ...updatedCourseParticipation, addedByName: user1.name, name: courses[0].name }],
          person,
          referral,
        })
        programmeHistoryPage.shouldContainSuccessMessage('You have successfully added a programme.')
      })

      it('displays an error when inputting a non numeric value for `yearCompleted`', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationPath)

        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.selectOutcome('complete')
        programmeHistoryDetailsPage.inputOutcomeYearCompleted('not a number')
        programmeHistoryDetailsPage.shouldContainButton('Continue').click()

        const programmeHistoryDetailsPageWithError = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPageWithError.shouldHaveErrors([
          {
            field: 'yearCompleted',
            message: 'Enter a year using numbers only',
          },
        ])
      })

      it('displays an error when inputting a non numeric value for `yearStarted`', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationPath)

        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.selectOutcome('incomplete')
        programmeHistoryDetailsPage.inputOutcomeYearStarted('not a number')
        programmeHistoryDetailsPage.shouldContainButton('Continue').click()

        const programmeHistoryDetailsPageWithError = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPageWithError.shouldHaveErrors([
          {
            field: 'yearStarted',
            message: 'Enter a year using numbers only',
          },
        ])
      })

      describe('for a participation with existing details', () => {
        const path = referPaths.programmeHistory.details.show({
          courseParticipationId: courseParticipationWithCourseId.id,
          referralId: referral.id,
        })

        beforeEach(() => {
          cy.task('stubParticipation', courseParticipationWithCourseId)

          cy.visit(path)
        })

        it('shows the details page with the form fields pre-populated', () => {
          const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: courseParticipationWithCourseId,
            person,
          })
          programmeHistoryDetailsPage.shouldHaveCorrectFormValues()
        })
      })
    })
  })

  describe('When removing from the programme history', () => {
    const path = referPaths.programmeHistory.delete({
      courseParticipationId: courseParticipationWithCourseId.id,
      referralId: referral.id,
    })

    beforeEach(() => {
      cy.task('stubParticipation', courseParticipationWithCourseId)
      cy.task('stubCourse', courses[0])

      cy.visit(path)
    })

    it('shows the delete page', () => {
      const deleteProgrammeHistoryPage = Page.verifyOnPage(DeleteProgrammeHistoryPage, {
        participation: presentedCourseParticipationWithCourseId,
        person,
        referral,
      })
      deleteProgrammeHistoryPage.shouldHavePersonDetails(person)
      deleteProgrammeHistoryPage.shouldContainNavigation(path)
      deleteProgrammeHistoryPage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
      deleteProgrammeHistoryPage.shouldContainHistorySummaryCards(
        [presentedCourseParticipationWithCourseId],
        referral.id,
        {
          change: false,
          remove: false,
        },
      )
      deleteProgrammeHistoryPage.shouldContainWarningText(
        'You are removing this programme. Once a programme has been removed, it cannot be undone.',
      )
      deleteProgrammeHistoryPage.shouldContainButton('Confirm')
    })

    it('deletes the entry and redirects to the programme history page', () => {
      cy.task('stubDeleteParticipation', courseParticipationWithCourseId.id)

      const deleteProgrammeHistoryPage = Page.verifyOnPage(DeleteProgrammeHistoryPage, {
        participation: presentedCourseParticipationWithCourseId,
        person,
        referral,
      })
      deleteProgrammeHistoryPage.confirm()

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        participations: [],
        person,
        referral,
      })
      programmeHistoryPage.shouldContainSuccessMessage('You have successfully removed a programme.')
    })
  })
})
