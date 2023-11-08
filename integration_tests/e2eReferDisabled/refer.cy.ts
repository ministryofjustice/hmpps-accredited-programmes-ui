import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
  sentenceAndOffenceDetailsFactory,
  userFactory,
} from '../../server/testutils/factories'
import { StringUtils } from '../../server/utils'
import NotFoundPage from '../pages/notFound'
import Page from '../pages/page'

context('Refer', () => {
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build({})
  const prisoner = prisonerFactory.build()
  const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
  const startedReferral = referralFactory
    .started()
    .build({ offeringId: courseOffering.id, prisonNumber: prisoner.prisonerNumber })
  const submittedReferral = referralFactory.submitted().build({
    offeringId: courseOffering.id,
    prisonNumber: prisoner.prisonerNumber,
  })
  const courseParticipation = courseParticipationFactory.build({
    courseName: course.name,
    prisonNumber: prisoner.prisonerNumber,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()
  })

  it("Doesn't show the start page for a referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.new.start({ courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'find person' page for a referral", () => {
    const path = referPaths.new.new({ courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'confirm person' page for a new referral", () => {
    cy.task('stubPrisoner', prisoner)

    const path = referPaths.new.people.show({
      courseOfferingId: courseOffering.id,
      prisonNumber: prisoner.prisonerNumber,
    })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the in-progress referral task list", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.new.show({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the person page for a referral", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.new.showPerson({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the confirm OASys form page", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.new.confirmOasys.show({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the additional information form page", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.new.additionalInformation.show({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the programme history index page", () => {
    cy.task('stubCourse', course)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const participations = [courseParticipation, ...courseParticipationFactory.buildList(2)]
    cy.task('stubParticipationsByPerson', { participations, prisonNumber: prisoner.prisonerNumber })

    const path = referPaths.new.programmeHistory.index({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the select programme page", () => {
    const courses = [course, ...courseFactory.buildList(3)]

    cy.task('stubCourses', courses)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.new.programmeHistory.new({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the update programme history details page", () => {
    cy.task('stubParticipation', courseParticipation)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.new.programmeHistory.details.show({
      courseParticipationId: courseParticipation.id,
      referralId: startedReferral.id,
    })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the delete programme history page", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)
    cy.task('stubParticipation', courseParticipation)
    cy.task('stubCourse', course)

    const path = referPaths.new.programmeHistory.delete({
      courseParticipationId: courseParticipation.id,
      referralId: startedReferral.id,
    })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the check answers page for a referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)

    const referral = referralFactory
      .submittable()
      .build({ offeringId: courseOffering.id, prisonNumber: prisoner.prisonerNumber })
    cy.task('stubReferral', referral)

    const path = referPaths.new.checkAnswers({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the complete page for a referral", () => {
    cy.task('stubReferral', submittedReferral)

    const path = referPaths.new.complete({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the additional information page for a submitted referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)

    const path = referPaths.show.additionalInformation({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the personal details page for a submitted referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)

    const path = referPaths.show.personalDetails({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the programme history page for a submitted referral", () => {
    const user = userFactory.build()
    const courseParticipationPresenter1 = {
      ...courseParticipationFactory.build({
        addedBy: user.username,
        courseName: course.name,
        prisonNumber: prisoner.prisonerNumber,
      }),
      addedByDisplayName: StringUtils.convertToTitleCase(user.name),
    }
    const courseParticipationPresenter2 = {
      ...courseParticipationFactory.build({
        addedBy: user.username,
        courseName: 'Another course name',
        prisonNumber: prisoner.prisonerNumber,
      }),
      addedByDisplayName: StringUtils.convertToTitleCase(user.name),
    }

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)
    cy.task('stubUserDetails', user)
    cy.task('stubParticipationsByPerson', {
      courseParticipations: [courseParticipationPresenter1, courseParticipationPresenter2],
      prisonNumber: prisoner.prisonerNumber,
    })

    const path = referPaths.show.programmeHistory({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the sentence information page for a submitted referral", () => {
    const sentenceAndOffenceDetails = sentenceAndOffenceDetailsFactory.build()
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)
    cy.task('stubSentenceAndOffenceDetails', { bookingId: prisoner.bookingId, sentenceAndOffenceDetails })

    const path = referPaths.show.sentenceInformation({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })
})
