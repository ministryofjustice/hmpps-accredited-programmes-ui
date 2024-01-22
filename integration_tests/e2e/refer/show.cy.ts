import { ApplicationRoles } from '../../../server/middleware/roleBasedAccessMiddleware'
import sharedTests from '../../support/sharedTests'

context('Viewing a submitted referral', () => {
  describe('When reviewing personal details', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsPersonalDetailsPage(ApplicationRoles.ACP_REFERRER)
    })
  })

  describe('When reviewing programme history', () => {
    describe('and there are CourseParticipation records for that person', () => {
      it('shows the correct information, including the CourseParticipation records', () => {
        sharedTests.referrals.showsProgrammeHistoryPage(ApplicationRoles.ACP_REFERRER)
      })
    })

    describe('and there are no CourseParticipation records for that person', () => {
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
    describe('and there are sentence details and release dates for that person', () => {
      it('shows the correct information, including the sentence details and release dates', () => {
        sharedTests.referrals.showsSentenceInformationPageWithAllData(ApplicationRoles.ACP_REFERRER)
      })
    })

    describe('and there are no sentence details and no release dates for that person', () => {
      it('shows the correct information, including a message for the missing sentence details and a message for the missing release dates', () => {
        sharedTests.referrals.showsSentenceInformationPageWithoutAllData(ApplicationRoles.ACP_REFERRER)
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

  context('And reviewing risks and needs', () => {
    describe('When reviewing Section 2 - Offence analysis', () => {
      describe('and there are offence details', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsOffenceAnalysisPageWithData(ApplicationRoles.ACP_REFERRER)
        })
      })

      describe('and there are no offence details', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsOffenceAnalysisPageWithoutData(ApplicationRoles.ACP_REFERRER)
        })
      })
    })

    describe('When reviewing Section 6 - Relationships', () => {
      describe('and there is relationships data', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsRelationshipsPageWithData(ApplicationRoles.ACP_REFERRER)
        })
      })

      describe('and there is no relationships data', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsRelationshipsPageWithoutData(ApplicationRoles.ACP_REFERRER)
        })
      })
    })

    describe('When reviewing Section R6 - ROSH analysis', () => {
      describe('and there is a ROSH analysis', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsRoshAnalysisPageWithData(ApplicationRoles.ACP_REFERRER)
        })
      })

      describe('and there is no ROSH analysis', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsRoshAnalysisPageWithoutData(ApplicationRoles.ACP_REFERRER)
        })
      })
    })

    describe('When reviewing Section 7 - Lifestyle and associates', () => {
      describe('and there is lifestyle data', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsLifestyleAndAssociatesPageWithData(ApplicationRoles.ACP_REFERRER)
        })
      })

      describe('and there is no lifestyle data', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsLifestyleAndAssociatesPageWithoutData(ApplicationRoles.ACP_REFERRER)
        })
      })
    })

    describe('When reviewing Section 10 - Emotional wellbeing', () => {
      describe('and there is psychiatric data', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsEmotionalWellbeingPageWithData(ApplicationRoles.ACP_REFERRER)
        })
      })

      describe('and there is no psychiatric data', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsEmotionalWellbeingPageWithoutData(ApplicationRoles.ACP_REFERRER)
        })
      })
    })
  })
})
