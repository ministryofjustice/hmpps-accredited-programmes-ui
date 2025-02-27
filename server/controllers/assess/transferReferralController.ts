import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, PniService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class TransferReferralController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
    private readonly pniService: PniService,
    private readonly referralService: ReferralService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      const { referralId } = req.params
      TypeUtils.assertHasUser(req)
      const { token: userToken, username } = req.user

      const returnLinkHref = assessPaths.show.personalDetails({ referralId })

      const referral = await this.referralService.getReferral(username, referralId)
      if (referral.closed || referral.status === 'on_programme') {
        return res.redirect(assessPaths.show.personalDetails({ referralId }))
      }

      const person = await this.personService.getPerson(username, referral.prisonNumber)
      const pni = await this.pniService
        .getPni(username, referral.prisonNumber, { gender: person.gender, savePNI: false })
        .catch(() => {
          return null
        })

      const pageHeading = 'This referral cannot be moved to Building Choices'
      let errorMessages

      if (!pni || pni.programmePathway === 'MISSING_INFORMATION') {
        errorMessages = [
          `This referral cannot be moved. Risk and need scores are missing for ${person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
          `You can see which scores are missing in the <a href="${assessPaths.show.pni({ referralId })}">programme needs identifier</a>.`,
          'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
        ]
      }

      if (pni?.programmePathway === 'ALTERNATIVE_PATHWAY') {
        errorMessages = [
          `This referral cannot be moved because the risk and need scores suggest that ${person.name} is not eligible for Building Choices. You can see these scores in the programme needs identifier.`,
        ]
      }

      if (errorMessages) {
        return res.render('referrals/transfer/error', {
          errorMessages,
          pageHeading,
          person,
          returnLinkHref,
        })
      }

      const [course, courseOffering] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.courseService.getOffering(username, referral.offeringId),
      ])

      const [targetBuildingChoicesCourse, organisation] = await Promise.all([
        pni?.programmePathway
          ? this.courseService.getBuildingChoicesCourseByReferral(username, referralId, pni.programmePathway)
          : null,
        this.organisationService.getOrganisation(userToken, courseOffering.organisationId),
      ])

      if (!targetBuildingChoicesCourse) {
        errorMessages = [
          `This referral cannot be moved because ${organisation.name} does not offer Building Choices: ${course.intensity?.toLocaleLowerCase()} intensity.`,
          'Close this referral and submit a new one to a different location.',
        ]
      }

      if (errorMessages) {
        return res.render('referrals/transfer/error', {
          errorMessages,
          pageHeading,
          person,
          returnLinkHref,
        })
      }

      // Placeholder for happy path
      return res.redirect(assessPaths.transferToBuildingChoices.reason.show({ referralId }))
    }
  }
}
