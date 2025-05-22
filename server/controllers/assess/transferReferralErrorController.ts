import type { Request, Response, TypedRequestHandler } from 'express'

import { assessPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService } from '../../services'
import { TypeUtils } from '../../utils'

export default class TransferReferralErrorController {
  constructor(
    private readonly courseService: CourseService,
    private readonly organisationService: OrganisationService,
    private readonly personService: PersonService,
  ) {}

  show(): TypedRequestHandler<Request, Response> {
    return async (req: Request, res: Response) => {
      TypeUtils.assertHasUser(req)

      let pageHeading = 'This referral cannot be moved to Building Choices'
      let errorText: Array<string>

      const { referralId } = req.params
      const { username } = req.user
      const { transferErrorData } = req.session

      if (!transferErrorData) {
        return res.redirect(assessPaths.show.personalDetails({ referralId }))
      }

      const { errorMessage, originalOfferingId, prisonNumber, duplicateReferralId } = transferErrorData

      if (errorMessage === 'DUPLICATE' && duplicateReferralId) {
        return res.redirect(assessPaths.show.duplicate({ referralId: duplicateReferralId }))
      }

      const person = await this.personService.getPerson(username, prisonNumber)

      if (errorMessage === 'MISSING_INFORMATION') {
        errorText = [
          `This referral cannot be moved. Risk and need scores are missing for ${person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
          `You can see which scores are missing in the <a class="govuk-link" href="${assessPaths.show.pni({ referralId })}">programme needs identifier</a>.`,
          'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
        ]
      } else if (errorMessage === 'ALTERNATIVE_PATHWAY') {
        errorText = [
          `This referral cannot be moved because the risk and need scores suggest that ${person.name} is not eligible for Building Choices. You can see these scores in the programme needs identifier.`,
        ]
      } else if (errorMessage === 'NO_COURSE') {
        const [originalCourse, originalOffering] = await Promise.all([
          this.courseService.getCourseByOffering(username, originalOfferingId),
          this.courseService.getOffering(username, originalOfferingId),
        ])
        const organisation = await this.organisationService.getOrganisationFromAcp(
          username,
          originalOffering.organisationId,
        )

        errorText = [
          `This referral cannot be moved because ${organisation.prisonName} does not offer the general offence strand of Building Choices: ${originalCourse.intensity?.toLowerCase()} intensity.`,
          'Close this referral and submit a new one to a different location.',
        ]
      } else {
        errorText = ['This referral cannot be moved at the moment because of an error. Try again later.']
        pageHeading = 'Cannot complete move to Building Choices'
      }

      return res.render('referrals/transfer/error/show', {
        backLinkHref: assessPaths.show.personalDetails({ referralId }),
        errorText,
        pageHeading,
        person,
      })
    }
  }
}
