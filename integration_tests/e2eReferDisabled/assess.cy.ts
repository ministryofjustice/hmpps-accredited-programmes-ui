import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { assessPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  courseParticipationFactory,
  offenderSentenceAndOffencesFactory,
  peopleSearchResponseFactory,
  prisonFactory,
  referralFactory,
  userFactory,
} from '../../server/testutils/factories'
import { StringUtils } from '../../server/utils'
import NotFoundPage from '../pages/notFound'
import Page from '../pages/page'

context('Refer', () => {
  const course = courseFactory.build()
  const courseOffering = courseOfferingFactory.build({})
  const prisoner = peopleSearchResponseFactory.build()
  const prison = prisonFactory.build({ prisonId: courseOffering.organisationId })
  const submittedReferral = referralFactory.submitted().build({
    offeringId: courseOffering.id,
    prisonNumber: prisoner.prisonerNumber,
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_PROGRAMME_TEAM] })
    cy.task('stubAuthUser')
    cy.task('stubDefaultCaseloads')
    cy.signIn()
  })

  it("Doesn't show the additional information page for a submitted referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)

    const path = assessPaths.show.additionalInformation({ referralId: submittedReferral.id })
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

    const path = assessPaths.show.personalDetails({ referralId: submittedReferral.id })
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

    const path = assessPaths.show.programmeHistory({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the offence history page for a submitted referral", () => {
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)
    cy.task('stubOffenderBooking', {
      offenceHistory: [],
      offenderNo: prisoner.prisonerNumber,
    })

    const path = assessPaths.show.offenceHistory({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })

  it("Doesn't show the sentence information page for a submitted referral", () => {
    const offenderSentenceAndOffences = offenderSentenceAndOffencesFactory.build()
    cy.task('stubCourseByOffering', { course, courseOfferingId: courseOffering.id })
    cy.task('stubOffering', { courseId: course.id, courseOffering })
    cy.task('stubPrison', prison)
    cy.task('stubPrisoner', prisoner)
    cy.task('stubReferral', submittedReferral)
    cy.task('stubOffenderSentenceAndOffences', { bookingId: prisoner.bookingId, offenderSentenceAndOffences })

    const path = assessPaths.show.sentenceInformation({ referralId: submittedReferral.id })
    cy.visit(path, { failOnStatusCode: false })

    const notFoundPage = Page.verifyOnPage(NotFoundPage)
    notFoundPage.shouldContain404H2()
  })
})
