import { ApplicationRoles } from '../../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  personFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  userFactory,
} from '../../../../server/testutils/factories'
import { type CourseParticipationDetailsBody, OrganisationUtils, StringUtils } from '../../../../server/utils'
import auth from '../../../mockApis/auth'
import Page from '../../../pages/page'
import {
  NewReferralDeleteProgrammeHistoryPage,
  NewReferralProgrammeHistoryDetailsPage,
  NewReferralProgrammeHistoryPage,
  NewReferralSelectProgrammePage,
  NewReferralTaskListPage,
} from '../../../pages/refer'
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
  const courses = courseFactory.buildList(4)
  const courseNames = courses.map(course => course.name)
  const addedByUser1 = userFactory.build({ username: auth.mockedUser.username })
  const addedByUser2 = userFactory.build()
  const courseParticipationWithKnownCourseName = courseParticipationFactory.build({
    addedBy: addedByUser1.username,
    courseName: courses[0].name,
    prisonNumber: person.prisonNumber,
  })
  const courseParticipationWithKnownCourseNamePresenter: CourseParticipationPresenter = {
    ...courseParticipationWithKnownCourseName,
    addedByDisplayName: StringUtils.convertToTitleCase(addedByUser1.name),
  }
  const courseParticipationWithUnknownCourseName = courseParticipationFactory.build({
    addedBy: addedByUser2.username,
    courseName: 'An course not in our system',
    prisonNumber: person.prisonNumber,
  })
  const courseParticipationWithUnknownCourseNamePresenter: CourseParticipationPresenter = {
    ...courseParticipationWithUnknownCourseName,
    addedByDisplayName: StringUtils.convertToTitleCase(addedByUser2.name),
  }
  const courseOffering = courseOfferingFactory.build()
  const referral = referralFactory.started().build({
    offeringId: courseOffering.id,
    prisonNumber: person.prisonNumber,
    referrerUsername: addedByUser1.username,
  })
  const programmeHistoryPath = referPaths.new.programmeHistory.index({ referralId: referral.id })
  const newParticipationPath = referPaths.new.programmeHistory.new({ referralId: referral.id })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubUserDetails', addedByUser1)
    cy.task('stubUserDetails', addedByUser2)
  })

  describe('Showing the programme history page', () => {
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const organisation = OrganisationUtils.organisationFromPrison(prison)

    const courseParticipations = [courseParticipationWithKnownCourseName, courseParticipationWithUnknownCourseName]
    const courseParticipationsPresenter: Array<CourseParticipationPresenter> = [
      courseParticipationWithKnownCourseNamePresenter,
      courseParticipationWithUnknownCourseNamePresenter,
    ]

    beforeEach(() => {
      cy.task('stubCourse', courses[0])
    })

    describe('when there is an existing programme history', () => {
      beforeEach(() => {
        cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })

        cy.visit(programmeHistoryPath)
      })

      it('shows the page with an existing programme history', () => {
        const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
          participations: courseParticipationsPresenter,
          person,
          referral,
        })
        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
        programmeHistoryPage.shouldContainHomeLink()
        programmeHistoryPage.shouldNotContainSuccessMessage()
        programmeHistoryPage.shouldContainPreHistoryText()
        programmeHistoryPage.shouldContainPreHistoryParagraph()
        programmeHistoryPage.shouldContainHistorySummaryCards(courseParticipationsPresenter, referral.id)
        programmeHistoryPage.shouldContainButtonLink('Add a programme', newParticipationPath)
        programmeHistoryPage.shouldContainButton('Skip this section')
      })

      describe('and the programme history has been reviewed', () => {
        beforeEach(() => {
          cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })
          cy.task('stubOffering', { courseId: courses[0].id, courseOffering })
          cy.task('stubPrison', prison)
          cy.task('stubUpdateReferral', referral.id)
        })

        it('updates the referral and redirects to the task list', () => {
          const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
            participations: courseParticipationsPresenter,
            person,
            referral,
          })
          programmeHistoryPage.reviewProgrammeHistory()

          const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
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
      const emptyCourseParticipationsPresenter: Array<CourseParticipationPresenter> = []

      beforeEach(() => {
        cy.task('stubParticipationsByPerson', {
          courseParticipations: emptyCourseParticipations,
          prisonNumber: prisoner.prisonerNumber,
        })

        cy.visit(programmeHistoryPath)
      })

      it('shows the page without an existing programme history', () => {
        const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
          participations: emptyCourseParticipationsPresenter,
          person,
          referral,
        })
        programmeHistoryPage.shouldHavePersonDetails(person)
        programmeHistoryPage.shouldContainBackLink(referPaths.new.show({ referralId: referral.id }))
        programmeHistoryPage.shouldContainHomeLink()
        programmeHistoryPage.shouldNotContainSuccessMessage()
        programmeHistoryPage.shouldContainNoHistoryText()
        programmeHistoryPage.shouldContainNoHistoryParagraphs()
        programmeHistoryPage.shouldContainButtonLink('Add a programme', newParticipationPath)
        programmeHistoryPage.shouldContainButton('Skip this section')
      })

      describe('and the programme history has been reviewed', () => {
        beforeEach(() => {
          cy.task('stubCourseByOffering', { course: courses[0], courseOfferingId: courseOffering.id })
          cy.task('stubOffering', { courseId: courses[0].id, courseOffering })
          cy.task('stubPrison', prison)
          cy.task('stubUpdateReferral', referral.id)
        })

        it('updates the referral and redirects to the task list', () => {
          const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
            participations: emptyCourseParticipationsPresenter,
            person,
            referral,
          })
          programmeHistoryPage.reviewProgrammeHistory()

          const taskListPage = Page.verifyOnPage(NewReferralTaskListPage, {
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
        cy.task('stubCourseNames', courseNames)
      })

      describe('for a new entry', () => {
        beforeEach(() => {
          cy.visit(newParticipationPath)
        })

        it('shows the select programme page', () => {
          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainBackLink(referPaths.new.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainHomeLink()
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldNotDisplayOtherCourseInput()
          selectProgrammePage.shouldDisplayOtherCourseInput()
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('creates the new entry and redirects to the details page', () => {
          cy.task('stubCreateParticipation', courseParticipationWithKnownCourseName)

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(courses[0].name)
          selectProgrammePage.submitSelection(courseParticipationWithKnownCourseName, courses[0].name)

          Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: courseParticipationWithKnownCourseName,
            person,
          })
        })

        it('displays an error when no programme is selected', () => {
          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePageWithError.shouldHaveErrors([
            {
              field: 'courseName',
              message: 'Select a programme',
            },
          ])
        })

        it('displays an error when "Other" is selected but a programme name is not provided', () => {
          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.selectCourse('Other')
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePageWithError.shouldHaveErrors([
            {
              field: 'otherCourseName',
              message: 'Enter the programme name',
            },
          ])
        })
      })

      describe('for an existing entry', () => {
        const courseParticipationWithKnownCourseNamePath = referPaths.new.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithKnownCourseName.id,
          referralId: referral.id,
        })
        const courseParticipationWithUnknownCourseNamePath = referPaths.new.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithUnknownCourseName.id,
          referralId: referral.id,
        })

        it('shows the select programme page for a history with a known programme', () => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)

          cy.visit(courseParticipationWithKnownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainBackLink(referPaths.new.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainHomeLink()
          selectProgrammePage.shouldContainCourseOptions()
          selectProgrammePage.shouldHaveSelectedCourse(courseParticipationWithKnownCourseName.courseName, true)
          selectProgrammePage.shouldNotDisplayOtherCourseInput()
          selectProgrammePage.shouldContainButton('Continue')
        })

        it('shows the select programme page for a history with an other programme', () => {
          cy.task('stubParticipation', courseParticipationWithUnknownCourseName)

          cy.visit(courseParticipationWithUnknownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.shouldHavePersonDetails(person)
          selectProgrammePage.shouldContainBackLink(referPaths.new.programmeHistory.index({ referralId: referral.id }))
          selectProgrammePage.shouldContainHomeLink()
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

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(newCourseName)
          selectProgrammePage.submitSelection(courseParticipationWithKnownCourseName, newCourseName)

          Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
            course: courses[2],
            courseParticipation: updatedParticipation,
            person,
          })
        })

        it('displays an error when "Other" is selected but a programme name is not provided', () => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)

          cy.visit(courseParticipationWithKnownCourseNamePath)

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.selectCourse('Other')
          selectProgrammePage.shouldContainButton('Continue').click()

          const selectProgrammePageWithError = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
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
        addedBy: addedByUser1.username,
        courseName: courses[0].name,
        prisonNumber: person.prisonNumber,
      })
      const newCourseParticipationDetailsPath = referPaths.new.programmeHistory.details.show({
        courseParticipationId: newCourseParticipation.id,
        referralId: referral.id,
      })

      it('shows the details page', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationDetailsPath)

        const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.shouldHavePersonDetails(person)
        programmeHistoryDetailsPage.shouldContainBackLink(
          referPaths.new.programmeHistory.editProgramme({
            courseParticipationId: newCourseParticipation.id,
            referralId: referral.id,
          }),
        )
        programmeHistoryDetailsPage.shouldContainHomeLink()
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
        const updatedCourseParticipationPresenter: CourseParticipationPresenter = {
          ...updatedCourseParticipation,
          addedByDisplayName: StringUtils.convertToTitleCase(addedByUser1.name),
        }

        const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
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

        Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
          participations: [{ ...updatedCourseParticipationPresenter, name: courses[0].name }],
          person,
          referral,
        })
      })

      it('displays an error when `yearCompleted` is invalid', () => {
        cy.task('stubParticipation', newCourseParticipation)

        cy.visit(newCourseParticipationDetailsPath)

        const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.selectOutcome('complete')
        programmeHistoryDetailsPage.inputOutcomeYearCompleted('not a number')
        programmeHistoryDetailsPage.shouldContainButton('Continue').click()

        const programmeHistoryDetailsPageWithError = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
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

        const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
          course: courses[0],
          courseParticipation: newCourseParticipation,
          person,
        })
        programmeHistoryDetailsPage.selectOutcome('incomplete')
        programmeHistoryDetailsPage.inputOutcomeYearStarted('not a number')
        programmeHistoryDetailsPage.shouldContainButton('Continue').click()

        const programmeHistoryDetailsPageWithError = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
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
        const path = referPaths.new.programmeHistory.details.show({
          courseParticipationId: courseParticipationWithKnownCourseName.id,
          referralId: referral.id,
        })

        beforeEach(() => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)

          cy.visit(path)
        })

        it('shows the details page with the form fields pre-populated', () => {
          const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
            course: courses[0],
            courseParticipation: courseParticipationWithKnownCourseName,
            person,
          })
          programmeHistoryDetailsPage.shouldHaveCorrectFormValues()
        })
      })
    })

    describe('success messages', () => {
      const courseParticipations = [courseParticipationWithKnownCourseName]
      const courseParticipationsPresenter = [courseParticipationWithKnownCourseNamePresenter]
      const addedSuccessMessage = 'You have successfully added a programme.'
      const updatedSuccessMessage = 'You have successfully updated a programme.'

      beforeEach(() => {
        cy.task('stubCourseNames', courseNames)
        cy.task('stubParticipationsByPerson', {
          courseParticipations,
          prisonNumber: prisoner.prisonerNumber,
        })
        cy.task('stubCourse', courses[0])
      })

      describe('when adding a new participation', () => {
        beforeEach(() => {
          cy.task('stubCreateParticipation', courseParticipationWithKnownCourseName)

          cy.visit(newParticipationPath)

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(courses[0].name)
          selectProgrammePage.submitSelection(courseParticipationWithKnownCourseName, courses[0].name)
        })

        describe('and updating details, then visiting the index', () => {
          it('shows an "added" success message', () => {
            const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
              course: courses[0],
              courseParticipation: courseParticipationWithKnownCourseName,
              person,
            })
            programmeHistoryDetailsPage.submitDetails()

            const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
              participations: courseParticipationsPresenter,
              person,
              referral,
            })
            programmeHistoryPage.shouldContainSuccessMessage(addedSuccessMessage)
          })
        })

        describe('then visiting the index without updating details', () => {
          it('shows an "added" success message', () => {
            cy.visit(programmeHistoryPath)

            const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
              participations: courseParticipationsPresenter,
              person,
              referral,
            })
            programmeHistoryPage.shouldContainSuccessMessage(addedSuccessMessage)
          })
        })

        describe('then visiting the index, then updating details and returning to the index', () => {
          it('shows an "updated" success message', () => {
            cy.visit(programmeHistoryPath)

            Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
              participations: courseParticipationsPresenter,
              person,
              referral,
            })

            const detailsPath = referPaths.new.programmeHistory.details.show({
              courseParticipationId: courseParticipationWithKnownCourseName.id,
              referralId: referral.id,
            })

            cy.visit(detailsPath)

            const programmeHistoryDetailsPage = Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
              course: courses[0],
              courseParticipation: courseParticipationWithKnownCourseName,
              person,
            })
            programmeHistoryDetailsPage.submitDetails()

            const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
              participations: courseParticipationsPresenter,
              person,
              referral,
            })
            programmeHistoryPage.shouldContainSuccessMessage(updatedSuccessMessage)
          })
        })
      })

      describe('when updating the course name, then visiting the index without updating details', () => {
        it('shows an "updated" success message', () => {
          cy.task('stubParticipation', courseParticipationWithKnownCourseName)
          cy.task('stubUpdateParticipation', courseParticipationWithKnownCourseName)

          const path = referPaths.new.programmeHistory.editProgramme({
            courseParticipationId: courseParticipationWithKnownCourseName.id,
            referralId: referral.id,
          })

          cy.visit(path)

          const selectProgrammePage = Page.verifyOnPage(NewReferralSelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(courses[2].name)
          selectProgrammePage.submitSelection(courseParticipationWithKnownCourseName, courses[2].name)

          Page.verifyOnPage(NewReferralProgrammeHistoryDetailsPage, {
            course: courses[2],
            courseParticipation: courseParticipationWithKnownCourseName,
            person,
          })

          cy.visit(programmeHistoryPath)

          const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
            participations: courseParticipationsPresenter,
            person,
            referral,
          })
          programmeHistoryPage.shouldContainSuccessMessage(updatedSuccessMessage)
        })
      })
    })
  })

  describe('When removing from the programme history', () => {
    const path = referPaths.new.programmeHistory.delete({
      courseParticipationId: courseParticipationWithKnownCourseName.id,
      referralId: referral.id,
    })

    beforeEach(() => {
      cy.task('stubParticipation', courseParticipationWithKnownCourseName)
      cy.task('stubCourse', courses[0])

      cy.visit(path)
    })

    it('shows the delete page', () => {
      const deleteProgrammeHistoryPage = Page.verifyOnPage(NewReferralDeleteProgrammeHistoryPage, {
        participation: courseParticipationWithKnownCourseName,
        person,
        referral,
      })
      deleteProgrammeHistoryPage.shouldHavePersonDetails(person)
      deleteProgrammeHistoryPage.shouldContainBackLink(
        referPaths.new.programmeHistory.index({ referralId: referral.id }),
      )
      deleteProgrammeHistoryPage.shouldContainHomeLink()
      deleteProgrammeHistoryPage.shouldContainHistorySummaryCards(
        [courseParticipationWithKnownCourseNamePresenter],
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

      const deleteProgrammeHistoryPage = Page.verifyOnPage(NewReferralDeleteProgrammeHistoryPage, {
        participation: courseParticipationWithKnownCourseName,
        person,
        referral,
      })
      deleteProgrammeHistoryPage.confirm()

      const programmeHistoryPage = Page.verifyOnPage(NewReferralProgrammeHistoryPage, {
        participations: [],
        person,
        referral,
      })
      programmeHistoryPage.shouldContainSuccessMessage('You have successfully removed a programme.')
    })
  })
})
