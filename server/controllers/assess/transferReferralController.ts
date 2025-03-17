import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { SanitisedError } from '../../sanitisedError'
import type { CourseService, PersonService, PniService, ReferralService } from '../../services'
import { FormUtils, ShowReferralUtils, TypeUtils } from '../../utils'
import type { Course, PniScore, Referral } from '@accredited-programmes-api'

export default class TransferReferralController {
  maxReasonLength = 500

  constructor(
    private readonly courseService: CourseService,
    private readonly personService: PersonService,
    private readonly pniService: PniService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      delete req.session.transferErrorData

      const { referralId } = req.params
      const { token, username } = req.user

      const referral = await this.referralService.getReferral(username, referralId)

      if (referral.closed || referral.status === 'on_programme') {
        return res.redirect(assessPaths.show.personalDetails({ referralId }))
      }

      const person = await this.personService.getPerson(username, referral.prisonNumber)

      try {
        const pniScore = await this.pniService.getPni(username, referral.prisonNumber, { gender: person.gender })

        const [targetCourse, originalCourse, statusHistory] = await Promise.all([
          this.checkForTargetCourse(pniScore, username, referral),
          this.courseService.getCourseByOffering(username, referral.offeringId),
          this.referralService.getReferralStatusHistory(token, username, referralId),
        ])

        FormUtils.setFieldErrors(req, res, ['transferReason'])
        FormUtils.setFormValues(req, res, { targetOfferingId: targetCourse.courseOfferings[0].id })

        return res.render('referrals/transfer/show', {
          backLinkHref: assessPaths.show.personalDetails({ referralId }),
          confirmationText: {
            primaryDescription: `This will transfer the referral from ${originalCourse.name} to ${targetCourse.name}.`,
            secondaryDescription: `You must give a reason for transferring this referral to ${targetCourse.name}`,
            secondaryHeading: 'Move referral',
            warningText: `The ${originalCourse.name} referral will close. A new referral to ${targetCourse.name} will be created.`,
          },
          maxReasonLength: this.maxReasonLength,
          pageHeading: `Move referral to ${targetCourse.name}`,
          person,
          timelineItems: ShowReferralUtils.statusHistoryTimelineItems(statusHistory).slice(0, 1),
        })
      } catch (error) {
        const { message: errorMessage, cause } = error as SanitisedError

        req.session.transferErrorData = {
          duplicateReferralId: errorMessage === 'DUPLICATE' && typeof cause === 'string' ? cause : undefined,
          errorMessage,
          originalOfferingId: referral.offeringId,
          originalReferralId: referral.id,
          prisonNumber: person.prisonNumber,
        }

        return res.redirect(assessPaths.transfer.error.show({ referralId: referral.id }))
      }
    }
  }

  private async checkForTargetCourse(pniScore: PniScore | null, username: string, referral: Referral): Promise<Course> {
    if (!pniScore) {
      throw new Error('MISSING_INFORMATION')
    }

    const { programmePathway } = pniScore

    if (programmePathway === 'MISSING_INFORMATION' || programmePathway === 'ALTERNATIVE_PATHWAY') {
      throw new Error(programmePathway)
    }

    const targetCourse = await this.courseService.getBuildingChoicesCourseByReferral(
      username,
      referral.id,
      programmePathway,
    )

    if (!targetCourse) {
      throw new Error('NO_COURSE')
    }

    const targetCourseOfferingId = targetCourse.courseOfferings[0].id

    if (targetCourseOfferingId) {
      const duplicates = await this.referralService.getDuplicateReferrals(
        username,
        targetCourseOfferingId,
        referral.prisonNumber,
      )

      if (duplicates.length) {
        throw new Error('DUPLICATE', { cause: duplicates[0].id })
      }
    }

    return targetCourse
  }
}
