import { ApplicationRoles } from '../../server/middleware/roleBasedAccessMiddleware'
import { findPaths, referPaths } from '../../server/paths'
import {
  courseFactory,
  courseOfferingFactory,
  peopleSearchResponseFactory,
  personFactory,
  pniScoreFactory,
  prisonFactory,
  referralFactory,
  userFactory,
} from '../../server/testutils/factories'
import { OrganisationUtils } from '../../server/utils'
import auth from '../mockApis/auth'
import {
  CourseOfferingPage,
  CoursePage,
  NotRecommendedProgrammePage,
  PersonSearchPage,
  RecommendedPathwayPage,
  RecommendedProgrammePage,
  SexualOffenceFormPage,
} from '../pages/find'
import Page from '../pages/page'
import {
  NewReferralConfirmPersonPage,
  NewReferralDuplicatePage,
  NewReferralStartPage,
  NewReferralTaskListPage,
} from '../pages/refer'

context('Find programmes based on PNI Pathway', () => {
  const personSearchPath = findPaths.pniFind.personSearch({})

  describe('For a user with the `ACP_REFERRER` role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', { authorities: [ApplicationRoles.ACP_REFERRER] })
      cy.task('stubAuthUser')
      cy.signIn()
    })

    it('Shows the person search page', () => {
      cy.visit(personSearchPath)

      const personSearchPage = Page.verifyOnPage(PersonSearchPage)
      personSearchPage.shouldContainPersonSearchInput()
      personSearchPage.shouldContainButton('Continue')
      personSearchPage.shouldContainLink('See a list of all programmes', findPaths.index({}))
    })

    describe('When submitting without a prison number', () => {
      it('Shows an error message', () => {
        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.shouldContainButton('Continue').click()
        personSearchPage.shouldHaveErrors([
          {
            field: 'prisonNumber',
            message: 'Enter a prison number',
          },
        ])
      })
    })

    describe('When submitting with a prison number but it cannot be found', () => {
      it('Shows an error message', () => {
        const enteredPrisonNumber = 'FAKEID'

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(enteredPrisonNumber)
        personSearchPage.shouldHaveErrors([
          {
            field: 'prisonNumber',
            message: `No person with prison number '${enteredPrisonNumber}' found`,
          },
        ])
      })
    })

    describe('When submitting with a prison number that can be found', () => {
      const prisonNumber = 'A1234AA'
      const prisoner = peopleSearchResponseFactory.build({
        dateOfBirth: '1980-01-01',
        firstName: 'Del',
        lastName: 'Hatton',
        prisonerNumber: prisonNumber,
      })
      const person = personFactory.build({
        currentPrison: prisoner.prisonName,
        dateOfBirth: '1 January 1980',
        ethnicity: prisoner.ethnicity,
        gender: prisoner.gender,
        name: `${prisoner.firstName} ${prisoner.lastName}`,
        prisonNumber,
        religionOrBelief: prisoner.religion,
        setting: 'Custody',
      })

      const becomingNewMeCourse = courseFactory.build({
        name: 'Becoming new me',
      })
      const buildingChoicesCourse = courseFactory.build({
        name: 'Building Choices',
      })

      const courses = [becomingNewMeCourse, buildingChoicesCourse, courseFactory.build()]
      const sortedCourses = [...courses].sort((courseA, courseB) => courseA.name.localeCompare(courseB.name))

      beforeEach(() => {
        cy.task('stubPrisoner', prisoner)
        cy.task('stubCourses', courses)
      })

      it('shows the correct content for a `HIGH_INTENSITY_BC` pathway', () => {
        const programmePathway = 'HIGH_INTENSITY_BC'
        const pniScore = pniScoreFactory.build({
          programmePathway,
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch({}))
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('How is this calculated?')
        recommendedPathwayPage
          .shouldContainButtonLink('Select a programme', findPaths.pniFind.recommendedProgrammes({}))
          .click()

        const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, { prisoner, programmePathway })
        recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
        recommendedProgrammePage.shouldContainHighIntensityContent()
        recommendedProgrammePage.shouldHaveCourses(sortedCourses)
        recommendedProgrammePage.shouldContainOverrideButton().click()

        const notRecommendedProgrammePage = Page.verifyOnPage(NotRecommendedProgrammePage, {
          prisoner,
          programmePathway,
        })
        notRecommendedProgrammePage.shouldContainHighIntensityContent()
        recommendedProgrammePage.shouldHaveCourses(sortedCourses)
      })

      it('shows the correct content for a `MODERATE_INTENSITY_BC` pathway', () => {
        const programmePathway = 'MODERATE_INTENSITY_BC'
        const pniScore = pniScoreFactory.build({
          programmePathway,
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch({}))
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('How is this calculated?')
        recommendedPathwayPage
          .shouldContainButtonLink('Select a programme', findPaths.pniFind.recommendedProgrammes({}))
          .click()

        const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, { prisoner, programmePathway })
        recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
        recommendedProgrammePage.shouldContainModerateIntensityContent()
        recommendedProgrammePage.shouldContainOverrideButton().click()

        const notRecommendedProgrammePage = Page.verifyOnPage(NotRecommendedProgrammePage, {
          prisoner,
          programmePathway,
        })
        notRecommendedProgrammePage.shouldContainModerateIntensityContent()
        recommendedProgrammePage.shouldHaveCourses(sortedCourses)
      })

      it('shows the correct content for an "ALTERNATIVE_PATHWAY" pathway', () => {
        const programmePathway = 'ALTERNATIVE_PATHWAY'
        const pniScore = pniScoreFactory.build({
          programmePathway,
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch({}))
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('How is this calculated?')
        recommendedPathwayPage.shouldContainStillMakeReferralHeading()
        recommendedPathwayPage.shouldContainNotEligibleStillMakeReferralText()
        recommendedPathwayPage.shouldContainLink('Cancel', findPaths.pniFind.personSearch({}))
        recommendedPathwayPage
          .shouldContainButtonLink('See all programmes', findPaths.pniFind.recommendedProgrammes({}))
          .click()

        const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, { prisoner, programmePathway })
        recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
        recommendedProgrammePage.shouldContainAlternativePathwayContent()
        recommendedProgrammePage.shouldHaveCourses(sortedCourses)
      })

      it('shows the correct content for a "MISSING_INFORMATION" pathway', () => {
        const programmePathway = 'MISSING_INFORMATION'
        const pniScore = pniScoreFactory.build({
          programmePathway,
        })

        cy.task('stubPni', { pniScore, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch({}))
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent(pniScore.programmePathway)
        recommendedPathwayPage.shouldContainPniDetails('What information is missing')
        recommendedPathwayPage.shouldContainLink('Cancel', findPaths.pniFind.personSearch({}))
        recommendedPathwayPage
          .shouldContainButtonLink('See all programmes', findPaths.pniFind.recommendedProgrammes({}))
          .click()

        const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, { prisoner, programmePathway })
        recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
        recommendedProgrammePage.shouldContainMissingInformationContent()
        recommendedProgrammePage.shouldHaveCourses(sortedCourses)
      })

      it('shows the correct content when there is no programme pathway', () => {
        cy.task('stubPni', { pniScore: null, prisonNumber })

        cy.visit(personSearchPath)

        const personSearchPage = Page.verifyOnPage(PersonSearchPage)
        personSearchPage.searchForPerson(prisonNumber)

        const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
        recommendedPathwayPage.shouldContainBackLink(findPaths.pniFind.personSearch({}))
        recommendedPathwayPage.shouldContainIntroText()
        recommendedPathwayPage.shouldContainPathwayContent('MISSING_INFORMATION')
        recommendedPathwayPage.shouldContainStillMakeReferralHeading()
        recommendedPathwayPage.shouldContainAllInformationMissingStillMakeReferralText()
        recommendedPathwayPage.shouldContainLink('Cancel', findPaths.pniFind.personSearch({}))
        recommendedPathwayPage
          .shouldContainButtonLink('See all programmes', findPaths.pniFind.recommendedProgrammes({}))
          .click()

        const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, {
          prisoner,
          programmePathway: 'UNKNOWN',
        })
        recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
        recommendedProgrammePage.shouldContainNoPniContent()
        recommendedProgrammePage.shouldHaveCourses(sortedCourses)
      })

      describe('And the user would like to make a referral', () => {
        const programmePathway = 'HIGH_INTENSITY_BC'
        const pniScore = pniScoreFactory.build({
          programmePathway,
        })

        const referableOffering = courseOfferingFactory.build({
          organisationId: 'MDI',
          referable: true,
        })
        const otherOfferings = courseOfferingFactory.buildList(2, { referable: false })
        const courseOfferings = [referableOffering, ...otherOfferings]

        const referablePrison = prisonFactory.build({
          prisonId: referableOffering.organisationId,
          prisonName: 'Moorland (HMP)',
        })
        const referableOrganisation = OrganisationUtils.organisationFromPrison(referablePrison)
        const prisons = [
          referablePrison,
          ...otherOfferings.map(courseOffering => prisonFactory.build({ prisonId: courseOffering.organisationId })),
        ]

        beforeEach(() => {
          cy.task('stubPni', { pniScore, prisonNumber })
          prisons.forEach(prison => cy.task('stubPrison', prison))
        })

        describe('to a non Building Choices programme', () => {
          beforeEach(() => {
            cy.task('stubCourse', becomingNewMeCourse)
            prisons.forEach(prison => cy.task('stubPrison', prison))
            cy.task('stubOfferingsByCourse', { courseId: becomingNewMeCourse.id, courseOfferings })
            cy.task('stubOffering', { courseOffering: referableOffering })
            cy.task('stubCourseByOffering', { course: becomingNewMeCourse, courseOfferingId: referableOffering.id })

            cy.visit(personSearchPath)

            const personSearchPage = Page.verifyOnPage(PersonSearchPage)
            personSearchPage.searchForPerson(prisonNumber)

            const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
            recommendedPathwayPage
              .shouldContainButtonLink('Select a programme', findPaths.pniFind.recommendedProgrammes({}))
              .click()

            const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, { prisoner, programmePathway })
            recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
            recommendedProgrammePage.shouldContainHighIntensityContent()
            recommendedProgrammePage.shouldHaveCourses(sortedCourses)
            recommendedProgrammePage
              .shouldContainLink(becomingNewMeCourse.name, findPaths.show({ courseId: becomingNewMeCourse.id }))
              .click()

            const coursePage = Page.verifyOnPage(CoursePage, becomingNewMeCourse)
            coursePage.shouldContainBackLink(findPaths.pniFind.recommendedProgrammes({}))
            coursePage.shouldContainHomeLink()
            coursePage.shouldHaveCourse()
            coursePage.shouldNotContainUpdateProgrammeLink()
            coursePage.shouldNotContainAddCourseOfferingLink()
            coursePage.shouldContainOfferingsText()
            coursePage.shouldHaveOrganisations(
              prisons.map(prison => ({
                ...OrganisationUtils.organisationFromPrison(prison),
                courseOfferingId: courseOfferings.find(offering => offering.organisationId === prison.prisonId)?.id,
              })),
            )
            coursePage
              .shouldContainLink(
                referablePrison.prisonName,
                findPaths.offerings.show({ courseOfferingId: referableOffering.id }),
              )
              .click()

            const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
              course: becomingNewMeCourse,
              courseOffering: referableOffering,
              organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
                referableOrganisation,
                referableOffering,
                becomingNewMeCourse.name,
              ),
            })
            courseOfferingPage.shouldContainBackLink(findPaths.show({ courseId: becomingNewMeCourse.id }))
            courseOfferingPage.shouldContainHomeLink()
            courseOfferingPage.shouldContainAudienceTag(courseOfferingPage.course.audienceTag)
            courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
            courseOfferingPage.shouldContainMakeAReferralButtonLink().click()

            const startReferralPage = Page.verifyOnPage(NewReferralStartPage, {
              course: becomingNewMeCourse,
              courseOffering: referableOffering,
              organisation: referableOrganisation,
              prisonNumber,
            })
            startReferralPage.shouldContainBackLink(
              findPaths.offerings.show({ courseOfferingId: referableOffering.id }),
            )
            startReferralPage.shouldContainHomeLink()
            startReferralPage.shouldContainOrganisationAndCourseHeading(startReferralPage)
            startReferralPage.shouldContainAudienceTag(startReferralPage.course.audienceTag)
            startReferralPage.shouldHaveProcessInformation()
            startReferralPage.shouldContainStartButtonLink().click()

            const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, {
              course: becomingNewMeCourse,
              courseOffering: referableOffering,
              person,
            })
            confirmPersonPage.shouldContainBackLink(referPaths.new.start({ courseOfferingId: referableOffering.id }))
            confirmPersonPage.shouldContainHomeLink()
            confirmPersonPage.shouldContainContinueButton()
            confirmPersonPage.shouldContainDifferentIdentifierLink()
            confirmPersonPage.shouldHavePersonInformation()
            confirmPersonPage.shouldContainText('This will save a draft referral.')
          })

          it('allows them to create the referral', () => {
            const referral = referralFactory.started().build({
              offeringId: referableOffering.id,
              prisonNumber,
              referrerUsername: auth.mockedUser.username,
            })

            cy.task('stubCreateReferral', { referral })
            cy.task('stubReferral', referral)

            const path = referPaths.new.people.show({
              courseOfferingId: referableOffering.id,
              prisonNumber,
            })
            cy.visit(path)

            const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, {
              course: becomingNewMeCourse,
              courseOffering: referableOffering,
              person,
            })
            confirmPersonPage.confirmPerson()

            Page.verifyOnPage(NewReferralTaskListPage, {
              course: becomingNewMeCourse,
              courseOffering: referableOffering,
              organisation: referableOrganisation,
              referral,
            })
          })

          describe('But a referral already exists for the person on the course offering', () => {
            it('redirects to the duplicate referral page', () => {
              const referral = referralFactory.submitted().build({
                offeringId: referableOffering.id,
                prisonNumber,
                referrerUsername: auth.mockedUser.username,
              })

              cy.task('stubCreateReferral', { referral, status: 409 })
              cy.task('stubReferral', referral)
              cy.task(
                'stubUserDetails',
                userFactory.build({ name: 'Referring User', username: referral.referrerUsername }),
              )
              cy.task('stubUserEmail', {
                email: 'referrer.email@test-email.co.uk',
                username: referral.referrerUsername,
                verified: true,
              })
              cy.task('stubStatusTransitions', {
                referralId: referral.id,
                statusTransitions: [],
              })

              const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, {
                course: becomingNewMeCourse,
                courseOffering: referableOffering,
                person,
              })
              confirmPersonPage.confirmPerson()

              const duplicatePage = Page.verifyOnPage(NewReferralDuplicatePage, {
                course: becomingNewMeCourse,
                courseOffering: referableOffering,
                organisation: referableOrganisation,
                person,
                referral,
              })
              duplicatePage.shouldContainBackLink(
                referPaths.new.people.show({
                  courseOfferingId: referableOffering.id,
                  prisonNumber: person.prisonNumber,
                }),
              )
              duplicatePage.shouldContainReferralExistsText()
              duplicatePage.shouldContainCourseOfferingSummaryList()
              duplicatePage.shouldContainSubmissionSummaryList('Referring User', 'referrer.email@test-email.co.uk')
              duplicatePage.shouldContainWarningText(
                'You cannot create this referral while a duplicate referral is open.',
              )
              duplicatePage.shouldContainButtonLink(
                'Return to programme list',
                findPaths.pniFind.recommendedProgrammes({}),
              )
            })
          })
        })

        describe('to a Building Choices programme', () => {
          beforeEach(() => {
            cy.task('stubCourse', buildingChoicesCourse)
            cy.task('stubPrison', prisonFactory.build({ female: false, prisonId: prisoner.prisonId }))
            cy.task('stubOffering', { courseOffering: referableOffering })
            cy.task('stubCourseByOffering', { course: buildingChoicesCourse, courseOfferingId: referableOffering.id })

            cy.visit(personSearchPath)

            const personSearchPage = Page.verifyOnPage(PersonSearchPage)
            personSearchPage.searchForPerson(prisonNumber)

            const recommendedPathwayPage = Page.verifyOnPage(RecommendedPathwayPage, { prisoner })
            recommendedPathwayPage
              .shouldContainButtonLink('Select a programme', findPaths.pniFind.recommendedProgrammes({}))
              .click()

            const recommendedProgrammePage = Page.verifyOnPage(RecommendedProgrammePage, { prisoner, programmePathway })
            recommendedProgrammePage.shouldContainBackLink(findPaths.pniFind.recommendedPathway({}))
            recommendedProgrammePage.shouldContainHighIntensityContent()
            recommendedProgrammePage.shouldHaveCourses(sortedCourses)
            recommendedProgrammePage
              .shouldContainLink(
                buildingChoicesCourse.name,
                findPaths.buildingChoices.form.show({ courseId: buildingChoicesCourse.id }),
              )
              .click()

            const sexualOffenceFormPage = Page.verifyOnPage(SexualOffenceFormPage, prisoner)
            sexualOffenceFormPage.shouldContainHintText()
            sexualOffenceFormPage.submitForm({ ...buildingChoicesCourse, courseOfferings })

            const coursePage = Page.verifyOnPage(CoursePage, buildingChoicesCourse)
            coursePage.shouldContainBackLink(
              findPaths.buildingChoices.form.show({ courseId: buildingChoicesCourse.id }),
            )
            coursePage.shouldContainHomeLink()
            coursePage.shouldContainBCFormSelectionSummaryList({
              isConvictedOfSexualOffence: 'true',
              isInAWomensPrison: 'false',
            })
            coursePage.shouldNotContainUpdateProgrammeLink()
            coursePage.shouldNotContainAddCourseOfferingLink()
            coursePage.shouldContainOfferingsText()
            coursePage.shouldHaveOrganisations(
              prisons.map(prison => ({
                ...OrganisationUtils.organisationFromPrison(prison),
                courseOfferingId: courseOfferings.find(offering => offering.organisationId === prison.prisonId)?.id,
              })),
            )
            coursePage
              .shouldContainLink(
                referablePrison.prisonName,
                findPaths.offerings.show({ courseOfferingId: referableOffering.id }),
              )
              .click()

            const courseOfferingPage = Page.verifyOnPage(CourseOfferingPage, {
              course: buildingChoicesCourse,
              courseOffering: referableOffering,
              organisation: OrganisationUtils.presentOrganisationWithOfferingEmails(
                referableOrganisation,
                referableOffering,
                buildingChoicesCourse.name,
              ),
            })
            courseOfferingPage.shouldContainBackLink(
              findPaths.buildingChoices.show({ courseId: buildingChoicesCourse.id }),
            )
            courseOfferingPage.shouldContainHomeLink()
            courseOfferingPage.shouldContainAudienceTag(courseOfferingPage.course.audienceTag)
            courseOfferingPage.shouldHaveOrganisationWithOfferingEmails()
            courseOfferingPage.shouldContainMakeAReferralButtonLink().click()

            const startReferralPage = Page.verifyOnPage(NewReferralStartPage, {
              course: buildingChoicesCourse,
              courseOffering: referableOffering,
              organisation: referableOrganisation,
              prisonNumber,
            })
            startReferralPage.shouldContainBackLink(
              findPaths.offerings.show({ courseOfferingId: referableOffering.id }),
            )
            startReferralPage.shouldContainHomeLink()
            startReferralPage.shouldContainOrganisationAndCourseHeading(startReferralPage)
            startReferralPage.shouldContainAudienceTag(startReferralPage.course.audienceTag)
            startReferralPage.shouldHaveProcessInformation()
            startReferralPage.shouldContainStartButtonLink().click()

            const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, {
              course: buildingChoicesCourse,
              courseOffering: referableOffering,
              person,
            })
            confirmPersonPage.shouldContainBackLink(referPaths.new.start({ courseOfferingId: referableOffering.id }))
            confirmPersonPage.shouldContainHomeLink()
            confirmPersonPage.shouldContainContinueButton()
            confirmPersonPage.shouldContainDifferentIdentifierLink()
            confirmPersonPage.shouldHavePersonInformation()
            confirmPersonPage.shouldContainText('This will save a draft referral.')
          })

          it('allows them to create the referral', () => {
            const referral = referralFactory.started().build({
              offeringId: referableOffering.id,
              prisonNumber,
              referrerUsername: auth.mockedUser.username,
            })

            cy.task('stubCreateReferral', { referral })
            cy.task('stubReferral', referral)

            const path = referPaths.new.people.show({
              courseOfferingId: referableOffering.id,
              prisonNumber,
            })
            cy.visit(path)

            const confirmPersonPage = Page.verifyOnPage(NewReferralConfirmPersonPage, {
              course: buildingChoicesCourse,
              courseOffering: referableOffering,
              person,
            })
            confirmPersonPage.confirmPerson()

            Page.verifyOnPage(NewReferralTaskListPage, {
              course: buildingChoicesCourse,
              courseOffering: referableOffering,
              organisation: referableOrganisation,
              referral,
            })
          })
        })
      })
    })
  })
})
