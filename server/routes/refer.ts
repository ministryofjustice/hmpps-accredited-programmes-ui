import type { Router } from 'express'

import type { Controllers } from '../controllers'
import { ApplicationRoles } from '../middleware/roleBasedAccessMiddleware'
import { referPaths } from '../paths'
import type { Services } from '../services'
import { RouteUtils } from '../utils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const {
    get,
    delete: deleteAction,
    post,
    put,
  } = RouteUtils.actions(router, services.auditService, { allowedRoles: [ApplicationRoles.ACP_REFERRER] })
  const {
    courseParticipationDetailsController,
    courseParticipationsController,
    reasonController,
    referralsController,
    peopleController,
    oasysConfirmationController,
  } = controllers

  get(referPaths.start.pattern, referralsController.start(), { auditEvent: 'REFER_VIEW_START' })
  get(referPaths.new.pattern, referralsController.new(), { auditEvent: 'REFER_VIEW_PERSON_SEARCH' })

  post(referPaths.people.find.pattern, peopleController.find(), {
    auditBodyParams: ['prisonNumber'],
    auditEvent: 'REFER_SEARCH_PERSON',
  })
  get(referPaths.people.show.pattern, peopleController.show(), {
    auditEvent: 'REFER_VIEW_FOUND_PERSON',
  })

  post(referPaths.create.pattern, referralsController.create(), { auditEvent: 'REFER_CREATE_DRAFT_REFERRAL' })
  get(referPaths.show.pattern, referralsController.show(), { auditEvent: 'REFER_VIEW_TASKLIST' })
  get(referPaths.showPerson.pattern, referralsController.showPerson(), {
    auditBodyParams: ['prisonNumber'],
    auditEvent: 'REFER_VIEW_REFERRED_PERSON',
  })

  get(referPaths.confirmOasys.show.pattern, oasysConfirmationController.show(), {
    auditEvent: 'REFER_VIEW_CONFIRM_OASYS',
  })
  put(referPaths.confirmOasys.update.pattern, oasysConfirmationController.update(), {
    redirectAuditEventSpecs: [
      {
        auditEvent: 'REFER_CONFIRM_OASYS_SUCCESS',
        path: referPaths.show.pattern,
      },
      {
        auditEvent: 'REFER_CONFIRM_OASYS_FAILURE',
        path: referPaths.confirmOasys.show.pattern,
      },
    ],
  })

  get(referPaths.reason.show.pattern, reasonController.show(), { auditEvent: 'REFER_VIEW_ADDITIONAL_INFORMATION' })
  put(referPaths.reason.update.pattern, reasonController.update(), {
    redirectAuditEventSpecs: [
      {
        auditEvent: 'REFER_ADD_ADDITIONAL_INFORMATION_SUCCESS',
        path: referPaths.show.pattern,
      },
      {
        auditEvent: 'REFER_ADD_ADDITIONAL_INFORMATION_FAILURE',
        path: referPaths.reason.show.pattern,
      },
    ],
  })

  get(referPaths.programmeHistory.index.pattern, courseParticipationsController.index(), {
    auditEvent: 'REFER_VIEW_PROGRAMME_HISTORY',
  })
  put(
    referPaths.programmeHistory.updateReviewedStatus.pattern,
    courseParticipationsController.updateHasReviewedProgrammeHistory(),
    { auditEvent: 'REFER_CONFIRM_PROGRAMME_HISTORY' },
  )
  get(referPaths.programmeHistory.new.pattern, courseParticipationsController.new(), {
    auditEvent: 'REFER_VIEW_NEW_PROGRAMME_HISTORY',
  })
  post(referPaths.programmeHistory.create.pattern, courseParticipationsController.create(), {
    redirectAuditEventSpecs: [
      {
        auditEvent: 'REFER_CREATE_COURSE_PARTICIPATION_SUCCESS',
        path: referPaths.programmeHistory.details.show.pattern,
      },
      {
        auditEvent: 'REFER_CREATE_COURSE_PARTICIPATION_FAILURE',
        path: referPaths.programmeHistory.create.pattern,
      },
    ],
  })
  get(referPaths.programmeHistory.editProgramme.pattern, courseParticipationsController.editCourse(), {
    auditEvent: 'REFER_VIEW_EDIT_COURSE_PARTICIPATION',
  })
  put(referPaths.programmeHistory.updateProgramme.pattern, courseParticipationsController.updateCourse(), {
    redirectAuditEventSpecs: [
      {
        auditEvent: 'REFER_UPDATE_COURSE_PARTICIPATION_SUCCESS',
        path: referPaths.programmeHistory.details.show.pattern,
      },
      {
        auditEvent: 'REFER_UPDATE_COURSE_PARTICIPATION_FAILURE',
        path: referPaths.programmeHistory.editProgramme.pattern,
      },
    ],
  })
  get(referPaths.programmeHistory.delete.pattern, courseParticipationsController.delete(), {
    auditEvent: 'REFER_VIEW_DELETE_COURSE_PARTICIPATION',
  })
  deleteAction(referPaths.programmeHistory.destroy.pattern, courseParticipationsController.destroy(), {
    auditEvent: 'REFER_DESTROY_COURSE_PARTICIPATION',
  })

  get(referPaths.programmeHistory.details.show.pattern, courseParticipationDetailsController.show(), {
    auditEvent: 'REFER_VIEW_COURSE_PARTICIPATION_DETAILS',
  })
  put(referPaths.programmeHistory.details.update.pattern, courseParticipationDetailsController.update(), {
    redirectAuditEventSpecs: [
      {
        auditEvent: 'REFER_UPDATE_COURSE_PARTICIPATION_DETAILS_SUCCESS',
        path: referPaths.programmeHistory.index.pattern,
      },
      {
        auditEvent: 'REFER_UPDATE_COURSE_PARTICIPATION_DETAILS_FAILURE',
        path: referPaths.programmeHistory.details.show.pattern,
      },
    ],
  })

  get(referPaths.checkAnswers.pattern, referralsController.checkAnswers(), {
    auditEvent: 'REFER_VIEW_CHECK_ANSWERS',
  })
  get(referPaths.complete.pattern, referralsController.complete(), {
    auditEvent: 'REFER_VIEW_CONFIRMATION',
  })
  post(referPaths.submit.pattern, referralsController.submit(), {
    redirectAuditEventSpecs: [
      {
        auditEvent: 'REFER_SUBMIT_REFERRAL_SUCCESS',
        path: referPaths.complete.pattern,
      },
      {
        auditEvent: 'REFER_SUBMIT_REFERRAK_FAILURE',
        path: referPaths.checkAnswers.pattern,
      },
    ],
  })

  return router
}
