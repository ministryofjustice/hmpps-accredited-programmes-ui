import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../../server/paths'
import {
  courseFactory,
  courseParticipationFactory,
  personFactory,
  prisonerFactory,
  referralFactory,
} from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { ProgrammeHistoryDetailsPage, ProgrammeHistoryPage, SelectProgrammePage } from '../../pages/refer'
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
      const path = referPaths.programmeHistory.details({
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
    })
  })
})
