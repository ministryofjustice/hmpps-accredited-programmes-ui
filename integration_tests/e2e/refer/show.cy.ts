import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import sharedTests from '../../support/sharedTests'

context('Viewing a submitted referral', () => {
  describe('When reviewing personal details', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsPersonalDetailsPage(ApplicationRoles.ACP_REFERRER)
    })
  })

  describe('When reviewing programme history', () => {
    describe('and there are CourseParticipation records for that user', () => {
      it('shows the correct information, including the CourseParticipation records', () => {
        sharedTests.referrals.showsProgrammeHistoryPage(ApplicationRoles.ACP_REFERRER)
      })
    })

    describe('and there are no CourseParticipation records for that user', () => {
      it('shows the correct information, including a message that there are no CourseParticipation records', () => {
        sharedTests.referrals.showsEmptyProgrammeHistoryPage(ApplicationRoles.ACP_REFERRER)
      })
    })
  })

  describe('When reviewing offence history', () => {
    describe('and there is an offence history', () => {
      it('shows the correct information, including the offence history', () => {
        sharedTests.referrals.showsOffenceHistoryPage(ApplicationRoles.ACP_REFERRER)
      })
    })

    describe('and there is no offence history', () => {
      it('shows the correct information, including a message that there is no offence history', () => {
        sharedTests.referrals.showsEmptyOffenceHistoryPage(ApplicationRoles.ACP_REFERRER)
      })
    })
  })

  describe('When reviewing sentence information', () => {
    describe('and there are sentence details and release dates for that user', () => {
      it('shows the correct information, including the sentence details and release dates', () => {
        sharedTests.referrals.showsSentenceInformationPageWithAllData(ApplicationRoles.ACP_REFERRER)
      })
    })

    describe('and there are release dates but no sentence details for that user', () => {
      it('shows the correct information, including the release dates, and a message for the missing sentence details', () => {
        sharedTests.referrals.showsSentenceInformationPageWithoutSentenceDetails(ApplicationRoles.ACP_REFERRER)
      })
    })
  })

  describe('When reviewing additional information', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsAdditionalInformationPage(ApplicationRoles.ACP_REFERRER)
    })
  })

  describe('When the referral is not submitted', () => {
    it('shows the auth error page', () => {
      sharedTests.referrals.showsErrorPageIfReferralNotSubmitted(ApplicationRoles.ACP_REFERRER)
    })
  })
})
