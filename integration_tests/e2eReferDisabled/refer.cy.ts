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
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it("Doesn't show the start page for a referral", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({})
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.start({ courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'find person' page for a referral", () => {
    cy.signIn()

    const courseOffering = courseOfferingFactory.build({})

    const path = referPaths.new({ courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'confirm person' page for a new referral", () => {
    cy.signIn()

    const courseOffering = courseOfferingFactory.build()
    const prisoner = prisonerFactory.build({
      dateOfBirth: '1980-01-01',
      firstName: 'Del',
      lastName: 'Hatton',
    })

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
    cy.signIn()

    const referral = referralFactory.started().build()
    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({ id: referral.offeringId })
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const prisoner = prisonerFactory.build({ prisonerNumber: referral.prisonNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.show({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the person page for a referral", () => {
    cy.signIn()

    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.showPerson({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the confirm OASys form page", () => {
    cy.signIn()

    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.confirmOasys.show({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the reason for referral form page", () => {
    cy.signIn()

    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.reason.show({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the programme history index page", () => {
    cy.signIn()

    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })
    const participations = courseParticipationFactory.buildList(3)
    const course = courseFactory.build()

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubParticipationsByPerson', { participations, prisonNumber: prisoner.prisonerNumber })
    cy.task('stubCourse', course)

    const path = referPaths.programmeHistory.index({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the select programme page", () => {
    cy.signIn()

    const courses = courseFactory.buildList(4)
    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })

    cy.task('stubCourses', courses)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.programmeHistory.create({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()

    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage2 = Page.verifyOnPage(NotFoundPage)
    notFoundPage2.shouldContain404H2()
  })

  it("Doesn't show the update programme history details page", () => {
    cy.signIn()

    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })
    const courseParticipation = courseParticipationFactory.build()

    cy.task('stubParticipation', courseParticipation)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.programmeHistory.details({
      courseParticipationId: courseParticipation.id,
      referralId: referral.id,
    })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()

    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage2 = Page.verifyOnPage(NotFoundPage)
    notFoundPage2.shouldContain404H2()
  })

  it("Doesn't show the delete programme history page", () => {
    cy.signIn()

    const prisoner = prisonerFactory.build()
    const referral = referralFactory.started().build({ prisonNumber: prisoner.prisonerNumber })
    const course = courseFactory.build()
    const participation = courseParticipationFactory.build({
      courseId: course.id,
      prisonNumber: prisoner.prisonerNumber,
    })

    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)
    cy.task('stubParticipation', participation)
    cy.task('stubCourse', course)

    const path = referPaths.programmeHistory.delete({
      courseParticipationId: participation.id,
      referralId: referral.id,
    })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the check answers page for a referral", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
    const prisoner = prisonerFactory.build()
    const referral = referralFactory
      .submittable()
      .build({ offeringId: courseOffering.id, prisonNumber: prisoner.prisonerNumber })

    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', referral)

    const path = referPaths.checkAnswers({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the complete page for a referral", () => {
    cy.signIn()

    const referral = referralFactory.submitted().build()

    cy.task('stubReferral', referral)

    const path = referPaths.complete({ referralId: referral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })
})
