import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import sharedTests from '../../support/sharedTests'

context('Viewing a submitted referral', () => {
  describe('When reviewing personal details', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsPersonalDetailsPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
    })
  })

  describe('When reviewing programme history', () => {
    describe('and there are CourseParticipation records for that user', () => {
      it('shows the correct information, including the CourseParticipation records', () => {
        sharedTests.referrals.showsProgrammeHistoryPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there are no CourseParticipation records for that user', () => {
      it('shows the correct information, including a message that there are no CourseParticipation records', () => {
        sharedTests.referrals.showsEmptyProgrammeHistoryPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing sentence information', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsSentenceInformationPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
    })
  })

  describe('When reviewing additional information', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsAdditionalInformationPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
    })
  })
})
