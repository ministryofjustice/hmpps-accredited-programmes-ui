import type { Request, Response, TypedRequestHandler } from 'express'
import createError from 'http-errors'

import { assessPaths } from '../../paths'
import type { CourseService, OrganisationService, PersonService, PniService, ReferralService } from '../../services'
import { TypeUtils } from '../../utils'

export default class TransferBuildingChoicesController {
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

      const referral = await this.referralService.getReferral(username, referralId)
      const returnPath = assessPaths.show.personalDetails({ referralId })
      if (referral.closed || referral.status === 'on_programme') return res.redirect(returnPath)

      const person = await this.personService.getPerson(username, referral.prisonNumber)
      const pni = await this.pniService
        .getPni(username, referral.prisonNumber, { gender: person.gender, savePNI: false })
        .catch(() => {
          return null
        })

      const pageHeading = 'This referral cannot be moved to Building Choices'
      let errorText

      if (!pni || pni.programmePathway === 'MISSING_INFORMATION') {
        errorText = [
          `This referral cannot be moved. Risk and need scores are missing for ${person.name}, so the recommended programme intensity (high or moderate) cannot be calculated.`,
          `You can see which scores are missing in the <a href="${assessPaths.show.pni({ referralId })}">programme needs identifier</a>.`,
          'Update the missing information in OASys to move the referral, or withdraw this referral and submit a new one.',
        ]
        return res.render('referrals/transfer/error', {
          errorMessages: errorText,
          pageHeading,
          person,
        })
      }

      if (pni?.programmePathway === 'ALTERNATIVE_PATHWAY') {
        errorText = [
          `This referral cannot be moved because the risk and need scores suggest that ${person.name} is not eligible for Building Choices. You can see these scores in the programme needs identifier.`,
        ]
        return res.render('referrals/transfer/error', {
          errorMessages: errorText,
          pageHeading,
          person,
        })
      }

      const [course, courseOffering] = await Promise.all([
        this.courseService.getCourseByOffering(username, referral.offeringId),
        this.courseService.getOffering(username, referral.offeringId),
      ])

      const targetBuildingChoicesCourse = await this.courseService.getBuildingChoicesCourseByReferral(
        username,
        referralId,
        pni.programmePathway,
      )

      const organisation = await this.organisationService.getOrganisation(userToken, courseOffering.organisationId)

      if (!targetBuildingChoicesCourse) {
        errorText = [
          `This referral cannot be moved because ${organisation.name} does not offer Building Choices: ${course.intensity?.toLocaleLowerCase()} intensity.`,
          'Close this referral and submit a new one to a different location.',
        ]
        return res.render('referrals/transfer/error', {
          errorMessages: errorText,
          pageHeading,
          person,
        })
      }

      const offerings = await this.courseService.getOfferingsByCourse(username, targetBuildingChoicesCourse?.id)

      const targetOfferingId = offerings.find(offering => offering.organisationId === organisation.id)?.id

      if (!targetOfferingId) {
        throw createError(404, `Error retriving offerings for Course Id ${targetBuildingChoicesCourse.id} `)
      }

      const duplicateReferrals = await this.referralService.getDuplicateReferrals(
        username,
        person.prisonNumber,
        targetOfferingId,
      )

      if (duplicateReferrals.length > 0) {
        const duplicateReferral = duplicateReferrals[0]
        return res.redirect(
          assessPaths.transferToBuildingChoices.reason.duplicate({ referralId: duplicateReferral.id }),
        )
      }

      return res.redirect(assessPaths.transferToBuildingChoices.reason.show({ referralId }))
    }
  }
}
