import { referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  prisonFactory,
  prisonerFactory,
  referralFactory,
} from '../../server/testutils/factories'
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
  const courseParticipation = courseParticipationFactory.build({
    courseName: course.name,
    prisonNumber: prisoner.prisonerNumber,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it("Doesn't show the start page for a referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.start({ courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'find person' page for a referral", () => {
    const path = referPaths.new({ courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'confirm person' page for a new referral", () => {
    cy.task('stubPrisoner', prisoner)

    const path = referPaths.people.show({
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

    const path = referPaths.show({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the person page for a referral", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.showPerson({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the confirm OASys form page", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.confirmOasys.show({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the additional information form page", () => {
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.additionalInformation.show({ referralId: startedReferral.id })
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

    const path = referPaths.programmeHistory.index({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the select programme page", () => {
    const courses = [course, ...courseFactory.buildList(3)]

    cy.task('stubCourses', courses)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.programmeHistory.new({ referralId: startedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the update programme history details page", () => {
    cy.task('stubParticipation', courseParticipation)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', startedReferral)

    const path = referPaths.programmeHistory.details.show({
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

    const path = referPaths.programmeHistory.delete({
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

    const path = referPaths.checkAnswers({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the complete page for a referral", () => {
    const referral = referralFactory.submitted().build()
    cy.task('stubReferral', referral)

    const path = referPaths.complete({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })
})
