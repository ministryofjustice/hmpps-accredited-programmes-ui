import type { Request, Response, TypedRequestHandler } from 'express'

import { findPaths, referPaths } from '../../paths'
import type { CourseService } from '../../services'
import { CourseUtils, FormUtils, TypeUtils } from '../../utils'

export default class HspReferralReasonController {
  MAX_LENGTH = 5000

  constructor(private readonly courseService: CourseService) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      const { username } = req.user
      const { courseId } = req.params
      const prisonNumber = req.session.pniFindAndReferData?.prisonNumber
      const programmePathway = req.session.pniFindAndReferData?.programmePathway

      const course = await this.courseService.getCourse(username, courseId)

      if (!prisonNumber || !programmePathway || !CourseUtils.isHsp(course.displayName)) {
        return res.redirect(findPaths.pniFind.personSearch.pattern)
      }

      FormUtils.setFieldErrors(req, res, ['hspReferralReason'])
      FormUtils.setFormValues(req, res)

      return res.render('courses/hsp/reason/show', {
        hrefs: {
          back: findPaths.hsp.notEligible.show({ courseId: course.id }),
        },
        maxLength: this.MAX_LENGTH,
        pageHeading: 'Reason for referral to HSP',
      })
    }
  }

  submit(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let hasErrors = false
      const { username } = req.user
      const { courseId } = req.params
      const { hspReferralReason } = req.body
      const formattedHspReferralReason = hspReferralReason?.trim()

      if (!formattedHspReferralReason) {
        req.flash('hspReferralReasonError', 'Please enter a reason for referring this person to HSP')
        hasErrors = true
      }

      if (formattedHspReferralReason.length > this.MAX_LENGTH) {
        req.flash('hspReferralReasonError', `Reason must be less than ${this.MAX_LENGTH} characters`)
        req.flash('formValues', [JSON.stringify({ formattedHspReferralReason })])
        hasErrors = true
      }

      if (hasErrors) {
        return res.redirect(findPaths.hsp.reason.show({ courseId }))
      }

      const nationalHspOffering = await this.courseService.getNationalOffering(username, courseId)

      if (!nationalHspOffering || !req.session.hspReferralData) {
        return res.redirect(findPaths.pniFind.personSearch({}))
      }

      req.session.hspReferralData.eligibilityOverrideReason = formattedHspReferralReason

      return res.redirect(referPaths.new.start({ courseOfferingId: nationalHspOffering.id }))
    }
  }
}
