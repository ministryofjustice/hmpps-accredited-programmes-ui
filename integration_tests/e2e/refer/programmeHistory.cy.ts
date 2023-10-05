import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  courseFactory,
  courseParticipationFactory,
  personFactory,
  prisonerFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import type { DetailsBody } from '../../../server/utils/courseParticipationUtils'
import Page from '../../pages/page'
import {
  DeleteProgrammeHistoryPage,
  ProgrammeHistoryDetailsPage,
  ProgrammeHistoryPage,
  SelectProgrammePage,
} from '../../pages/refer'
import type { CourseParticipation, CourseParticipationWithName } from '@accredited-programmes/models'

context('Programme history', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
  })

  describe('Showing the programme history page', () => {
    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({
      currentPrison: prisoner.prisonName,
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
    })

    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    const course = courseFactory.build()

    const courseParticipations = [
      courseParticipationFactory.withCourseId().build({ courseId: course.id }),
      courseParticipationFactory.withOtherCourseName().build({ otherCourseName: 'A great course name' }),
    ]
    const courseParticipationsWithNames: Array<CourseParticipationWithName> = [
      { ...courseParticipations[0], name: course.name },
      {
        ...courseParticipations[1],
        name: courseParticipations[1].otherCourseName as CourseParticipationWithName['name'],
      },
    ]

    const path = referPaths.programmeHistory.index({ referralId: referral.id })

    beforeEach(() => {
      cy.signIn()

      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)
      cy.task('stubCourse', course)
    })

    it('shows the page with an existing programme history', () => {
      cy.task('stubParticipationsByPerson', { courseParticipations, prisonNumber: prisoner.prisonerNumber })

      cy.visit(path)

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        participationsWithNames: courseParticipationsWithNames,
        person,
        referral,
      })
      programmeHistoryPage.shouldHavePersonDetails(person)
      programmeHistoryPage.shouldContainNavigation(path)
      programmeHistoryPage.shouldContainBackLink(referPaths.show({ referralId: referral.id }))
      programmeHistoryPage.shouldNotContainSuccessMessage()
      programmeHistoryPage.shouldContainPreHistoryParagraph()
      programmeHistoryPage.shouldContainHistorySummaryCards(courseParticipationsWithNames, referral.id)
      programmeHistoryPage.shouldContainButton('Continue')
      programmeHistoryPage.shouldContainButtonLink(
        'Add another',
        referPaths.programmeHistory.new({ referralId: referral.id }),
      )
    })

    it('shows the page without an existing programme history', () => {
      const emptyCourseParticipations: Array<CourseParticipation> = []
      cy.task('stubParticipationsByPerson', {
        courseParticipations: emptyCourseParticipations,
        prisonNumber: prisoner.prisonerNumber,
      })

      cy.visit(path)

      const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
        participationsWithNames: emptyCourseParticipations as Array<CourseParticipationWithName>,
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
  })

  describe('When adding to the programme history', () => {
    const courses = courseFactory.buildList(4)
    const prisoner = prisonerFactory.build({
      firstName: 'Del',
      lastName: 'Hatton',
    })
    const person = personFactory.build({
      currentPrison: prisoner.prisonName,
      name: 'Del Hatton',
      prisonNumber: prisoner.prisonerNumber,
    })
    const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })

    describe('and selecting a programme', () => {
      beforeEach(() => {
        cy.task('stubCourses', courses)
        cy.task('stubPrisoner', prisoner)
        cy.task('stubReferral', referral)
      })

      describe('for a new entry', () => {
        const path = referPaths.programmeHistory.new({ referralId: referral.id })

        beforeEach(() => {
          cy.signIn()

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
          const courseParticipation = courseParticipationFactory
            .withCourseId()
            .build({ courseId: courses[0].id, prisonNumber: person.prisonNumber })

          cy.task('stubCreateParticipation', courseParticipation)

          const selectProgrammePage = Page.verifyOnPage(SelectProgrammePage, { courses })
          selectProgrammePage.selectCourse(courses[0].id)
          selectProgrammePage.submitSelection(courseParticipation, courses[0].id)

          Page.verifyOnPage(ProgrammeHistoryDetailsPage)
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
        const courseParticipationWithCourseId = courseParticipationFactory
          .withCourseId()
          .build({ courseId: courses[0].id, prisonNumber: person.prisonNumber })
        const courseParticipationWithCourseIdPath = referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithCourseId.id,
          referralId: referral.id,
        })
        const courseParticipationWithOtherCourseName = courseParticipationFactory
          .withOtherCourseName()
          .build({ otherCourseName: 'A great course name', prisonNumber: person.prisonNumber })
        const courseParticipationWithOtherCourseNamePath = referPaths.programmeHistory.editProgramme({
          courseParticipationId: courseParticipationWithOtherCourseName.id,
          referralId: referral.id,
        })

        beforeEach(() => {
          cy.task('stubCourses', courses)
          cy.task('stubPrisoner', prisoner)
          cy.task('stubReferral', referral)

          cy.signIn()
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

          Page.verifyOnPage(ProgrammeHistoryDetailsPage)
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
      const courseParticipation = courseParticipationFactory
        .withCourseId()
        .build({ courseId: courses[0].id, prisonNumber: person.prisonNumber })
      const path = referPaths.programmeHistory.details.show({
        courseParticipationId: courseParticipation.id,
        referralId: referral.id,
      })

      beforeEach(() => {
        cy.task('stubParticipation', courseParticipation)
        cy.task('stubPrisoner', prisoner)
        cy.task('stubReferral', referral)

        cy.signIn()

        cy.visit(path)
      })

      it('shows the details page', () => {
        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPage.shouldContainNavigation(path)
        programmeHistoryDetailsPage.shouldHavePersonDetails(person)
        programmeHistoryDetailsPage.shouldContainBackLink(
          referPaths.programmeHistory.index({ referralId: referral.id }),
        )
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
        programmeHistoryDetailsPage.shouldContainOutcomeDetailTextArea()
        programmeHistoryDetailsPage.shouldContainSourceTextArea()
        programmeHistoryDetailsPage.shouldContainButton('Continue')
      })

      it('updates the entry and redirects to the programme history page', () => {
        const formValues: DetailsBody = {
          outcome: {
            detail: 'Some outcome details',
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
          ...courseParticipation,
          outcome: {
            detail: formValues.outcome.detail,
            status: formValues.outcome.status,
            yearCompleted: Number(formValues.outcome),
          },
          setting: {
            location: formValues.setting.communityLocation,
            type: formValues.setting.type,
          },
          source: formValues.source,
        })

        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPage.selectSetting(formValues.setting.type as string)
        programmeHistoryDetailsPage.inputCommunityLocation(formValues.setting.communityLocation)
        programmeHistoryDetailsPage.selectOutcome(formValues.outcome.status as string)
        programmeHistoryDetailsPage.inputOutcomeYearCompleted(formValues.outcome.yearCompleted)
        programmeHistoryDetailsPage.inputOutcomeDetail(formValues.outcome.detail)
        programmeHistoryDetailsPage.inputSource(formValues.source)
        programmeHistoryDetailsPage.submitDetails(updatedCourseParticipation, courses[0], person)

        const programmeHistoryPage = Page.verifyOnPage(ProgrammeHistoryPage, {
          participationsWithNames: [{ ...updatedCourseParticipation, name: courses[0].name }],
          person,
          referral,
        })
        programmeHistoryPage.shouldContainSuccessMessage()
      })

      it('displays an error when inputting a non numeric value for `yearCompleted`', () => {
        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPage.selectOutcome('complete')
        programmeHistoryDetailsPage.inputOutcomeYearCompleted('not a number')
        programmeHistoryDetailsPage.shouldContainButton('Continue').click()

        const programmeHistoryDetailsPageWithError = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPageWithError.shouldHaveErrors([
          {
            field: 'yearCompleted',
            message: 'Enter a year using numbers only',
          },
        ])
      })

      it('displays an error when inputting a non numeric value for `yearStarted`', () => {
        const programmeHistoryDetailsPage = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPage.selectOutcome('incomplete')
        programmeHistoryDetailsPage.inputOutcomeYearStarted('not a number')
        programmeHistoryDetailsPage.shouldContainButton('Continue').click()

        const programmeHistoryDetailsPageWithError = Page.verifyOnPage(ProgrammeHistoryDetailsPage)
        programmeHistoryDetailsPageWithError.shouldHaveErrors([
          {
            field: 'yearStarted',
            message: 'Enter a year using numbers only',
          },
        ])
      })
    })
  })

  describe('When removing from the programme history', () => {
    it('shows the delete page', () => {
      const prisoner = prisonerFactory.build({
        firstName: 'Del',
        lastName: 'Hatton',
      })
      const person = personFactory.build({
        currentPrison: prisoner.prisonName,
        name: 'Del Hatton',
        prisonNumber: prisoner.prisonerNumber,
      })

      const referral = referralFactory.started().build({ prisonNumber: person.prisonNumber })
      const course = courseFactory.build()
      const courseParticipation = courseParticipationFactory
        .withCourseId()
        .build({ courseId: course.id, prisonNumber: person.prisonNumber })
      const courseParticipationWithName = { ...courseParticipation, name: course.name }

      cy.task('stubPrisoner', prisoner)
      cy.task('stubReferral', referral)
      cy.task('stubParticipation', courseParticipation)
      cy.task('stubCourse', course)

      cy.signIn()

      const path = referPaths.programmeHistory.delete({
        courseParticipationId: courseParticipation.id,
        referralId: referral.id,
      })
      cy.visit(path)

      const deleteProgrammeHistoryPage = Page.verifyOnPage(DeleteProgrammeHistoryPage, {
        participationWithName: courseParticipationWithName,
        person,
        referral,
      })
      deleteProgrammeHistoryPage.shouldHavePersonDetails(person)
      deleteProgrammeHistoryPage.shouldContainNavigation(path)
      deleteProgrammeHistoryPage.shouldContainBackLink(referPaths.programmeHistory.index({ referralId: referral.id }))
      deleteProgrammeHistoryPage.shouldContainHistorySummaryCards([courseParticipationWithName], referral.id, false)
      deleteProgrammeHistoryPage.shouldContainWarningText(
        'You are removing this programme. Once a programme has been removed, it cannot be undone.',
      )
      deleteProgrammeHistoryPage.shouldContainButton('Confirm')
    })
  })
})
