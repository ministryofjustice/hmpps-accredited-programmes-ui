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
  const courses = courseFactory.buildList(4)
  const courseParticipationWithKnownCourseName = courseParticipationFactory.build({
    courseName: courses[0].name,
    prisonNumber: person.prisonNumber,
  })
  const courseParticipationWithUnknownCourseName = courseParticipationFactory.build({
    courseName: 'An course not in our system',
    prisonNumber: person.prisonNumber,
  })
  const courseOffering = courseOfferingFactory.build()
  const referral = referralFactory.started().build({ offeringId: courseOffering.id, prisonNumber: person.prisonNumber })
  const programmeHistoryPath = referPaths.programmeHistory.index({ referralId: referral.id })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
  })

  describe('Showing the programme history page', () => {
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)

    const courseParticipations = [courseParticipationWithKnownCourseName, courseParticipationWithUnknownCourseName]

    beforeEach(() => {
      cy.task('stubCourse', courses[0])
    })

    describe('when there is an existing programme history', () => {
      beforeEach(() => {
        cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })

        cy.visit(programmeHistoryPath)
      })

      it('shows the page with an existing programme history', () => {
        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          participations: courseParticipations,
          person,
          referral,
        })
        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainNavigation(programmeHistoryPath)
        programmeHistoryPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
        programmeHistoryPage.shouldNotContainSuccessMessage()
        programmeHistoryPage.shouldContainPreHistoryParagraph()
        programmeHistoryPage.shouldContainHistorySummaryCards(courseParticipations, referral.id)
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
            participations: courseParticipations,
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

        cy.visit(programmeHistoryPath)
      })

      it('shows the page without an existing programme history', () => {
        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          participations: emptyCourseParticipations as Array<CourseParticipation>,
          person,
          referral,
        })
        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainNavigation(programmeHistoryPath)
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
            participations: courseParticipations,
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
          cy.task('stubCreateParticipation', courseParticipationWithKnownCourseName)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(courses[0].name)
          selectProgrammePage.submitSelection(courseParticipationWithKnownCourseName, courses[0].name)

          Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: courseParticipationWithKnownCourseName,
            person,
          })
        })

        it('displays an error when no programme is selected', () => {
          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePageWithError.shouldHaveErrors([
            {
              field: 'courseName',
              message: 'Select a programme',
            },
          ])
        })

        it('displays an error when "Other" is selected but a programme name is not provided', () => {
          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse('Other')
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
        const courseParticipationWithKnownCourseNamePath = referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithKnownCourseName.id,
          referralId: referral.id,
        })
        const courseParticipationWithUnknownCourseNamePath = referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithUnknownCourseName.id,
          referralId: referral.id,
        })

        it('shows the select programme page for a history with a known programme', () => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)

          cy.visit(courseParticipationWithKnownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainNavigation(courseParticipationWithKnownCourseNamePath)
          selectProgrammePage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldHaveSelectedCourse(courseParticipationWithKnownCourseName.courseName, true)
          selectProgrammePage.shouldNotDisplayOtherCourseInput()
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('shows the select programme page for a history with an other programme', () => {
          cy.task('stubParticipation', courseParticipationWithUnknownCourseName)

          cy.visit(courseParticipationWithUnknownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainNavigation(courseParticipationWithUnknownCourseNamePath)
          selectProgrammePage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldDisplayOtherCourseInput()
          selectProgrammePage.shouldHaveSelectedCourse(courseParticipationWithUnknownCourseName.courseName, false)
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('updates the entry and redirects to the details page', () => {
          const newCourseName = courses[2].name
          const updatedParticipation = { ...courseParticipationWithKnownCourseName, courseName: newCourseName }

          cy.task('stubParticipation', courseParticipationWithKnownCourseName)
          cy.task('stubUpdateParticipation', updatedParticipation)

          cy.visit(courseParticipationWithKnownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(newCourseName)
          selectProgrammePage.submitSelection(courseParticipationWithKnownCourseName, newCourseName)

          Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: updatedParticipation,
            person,
          })
        })

        it('displays an error when "Other" is selected but a programme name is not provided', () => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)

          cy.visit(courseParticipationWithKnownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse('Other')
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
        courseName: courses[0].name,
        prisonNumber: person.prisonNumber,
      })
      const newCourseParticipationDetailsPath = referPaths.programmeHistory.details.show({
        courseParticipationId: newCourseParticipation.id,
        referralId: referral.id,
      })

      it('shows the details page', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationDetailsPath)

        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.shouldContainNavigation(newCourseParticipationDetailsPath)
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

        cy.visit(newCourseParticipationDetailsPath)

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
          participations: [{ ...updatedCourseParticipation, name: courses[0].name }],
          person,
          referral,
        })
        programmeHistoryPage.shouldContainSuccessMessage('You have successfully added a programme.')
      })

      it('displays an error when `yearCompleted` is invalid', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationDetailsPath)

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

      it('displays an error when `yearStarted` is invalid', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationDetailsPath)

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
          courseParticipationId: courseParticipationWithKnownCourseName.id,
          referralId: referral.id,
        })

        beforeEach(() => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)

          cy.visit(path)
        })

        it('shows the details page with the form fields pre-populated', () => {
          const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: courseParticipationWithKnownCourseName,
            person,
          })
          programmeHistoryDetailsPage.shouldHaveCorrectFormValues()
        })
      })
    })
  })

  describe('When removing from the programme history', () => {
    const path = referPaths.programmeHistory.delete({
      courseParticipationId: courseParticipationWithKnownCourseName.id,
      referralId: referral.id,
    })

    beforeEach(() => {
      cy.task('stubParticipation', courseParticipationWithKnownCourseName)
      cy.task('stubCourse', courses[0])

      cy.visit(path)
    })

    it('shows the delete page', () => {
      const deleteProgrammeHistoryPage = Page.verifyOnPage(DeleteProgrammeHistoryPage, {
        participation: courseParticipationWithKnownCourseName,
        person,
        referral,
      })
      deleteProgrammeHistoryPage.shouldHavePersonDetails(person)
      deleteProgrammeHistoryPage.shouldContainNavigation(path)
      deleteProgrammeHistoryPage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
      deleteProgrammeHistoryPage.shouldContainHistorySummaryCards(
        [courseParticipationWithKnownCourseName],
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
      cy.task('stubDeleteParticipation', courseParticipationWithKnownCourseName.id)

      const deleteProgrammeHistoryPage = Page.verifyOnPage(DeleteProgrammeHistoryPage, {
        participation: courseParticipationWithKnownCourseName,
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
