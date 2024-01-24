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

  describe('When reviewing offence history', () => {
    describe('and there is an offence history', () => {
      it('shows the correct information, including the offence history', () => {
        sharedTests.referrals.showsOffenceHistoryPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no offence history', () => {
      it('shows the correct information, including a message that there is no offence history', () => {
        sharedTests.referrals.showsEmptyOffenceHistoryPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing sentence information', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsSentenceInformationPageWithAllData(ApplicationRoles.ACP_PROGRAMME_TEAM)
    })
  })

  describe('When reviewing additional information', () => {
    it('shows the correct information', () => {
      sharedTests.referrals.showsAdditionalInformationPage(ApplicationRoles.ACP_PROGRAMME_TEAM)
    })
  })

  describe('When the referral is not submitted', () => {
    it('shows the auth error page', () => {
      sharedTests.referrals.showsErrorPageIfReferralNotSubmitted(ApplicationRoles.ACP_PROGRAMME_TEAM)
    })
  })

  context('And reviewing risks and needs', () => {
    describe('When reviewing risks and alerts', () => {
      describe('and there are risks and alerts', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsRisksAndAlertsPageWithData(ApplicationRoles.ACP_REFERRER)
        })
      })

      describe('and there are no risks and alerts', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsRisksAndAlertsPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
        })
      })
    })

    describe('When reviewing Section 2 - Offence analysis', () => {
      describe('and there are offence details', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsOffenceAnalysisPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
        })
      })

      describe('and there are no offence details', () => {
        it('shows the correct information', () => {
          sharedTests.risksAndNeeds.showsOffenceAnalysisPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
        })
      })
    })
  })

  describe('When reviewing Section 6 - Relationships', () => {
    describe('and there is relationships data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsRelationshipsPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no relationships data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsRelationshipsPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing Section R6 - RoSH analysis', () => {
    describe('and there is a RoSH analysis', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsRoshAnalysisPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no RoSH analysis', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsRoshAnalysisPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing Section 7 - Lifestyle and associates', () => {
    describe('and there is lifestyle data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsLifestyleAndAssociatesPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no lifestyle data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsLifestyleAndAssociatesPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing Section 10 - Emotional wellbeing', () => {
    describe('and there is psychiatric data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsEmotionalWellbeingPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no psychiatric data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsEmotionalWellbeingPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing Section 11 - Thinking and behaving', () => {
    describe('and there is behaviour data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsThinkingAndBehavingPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no behaviour data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsThinkingAndBehavingPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })

  describe('When reviewing Section 12 - Attitudes', () => {
    describe('and there is attitude data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsAttitudesPageWithData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })

    describe('and there is no attitude data', () => {
      it('shows the correct information', () => {
        sharedTests.risksAndNeeds.showsAttitudesPageWithoutData(ApplicationRoles.ACP_PROGRAMME_TEAM)
      })
    })
  })
})
