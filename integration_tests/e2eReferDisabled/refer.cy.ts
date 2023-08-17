import { referPaths } from '../../server/paths'
import { courseFactory, courseOfferingFactory, prisonFactory, prisonerFactory } from '../../server/testutils/factories'
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

    cy.task('stubCourse', course)
    cy.task('stubCourseOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)

    const path = referPaths.start({ courseId: course.id, courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'find person' page for a referral", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build({})

    const path = referPaths.new({ courseId: course.id, courseOfferingId: courseOffering.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the 'confirm person' page for a new referral", () => {
    cy.signIn()

    const course = courseFactory.build()
    const courseOffering = courseOfferingFactory.build()
    const prisoner = prisonerFactory.build({
      dateOfBirth: '1980-01-01',
      firstName: 'Del',
      lastName: 'Hatton',
    })

    cy.task('stubPrisoner', prisoner)

    const path = referPaths.people.show({
      courseId: course.id,
      courseOfferingId: courseOffering.id,
      prisonNumber: prisoner.prisonerNumber,
    })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })
})
