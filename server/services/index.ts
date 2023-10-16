/* istanbul ignore file */

import AuditService from './auditService'
import CourseService from './courseService'
import healthCheck from './healthCheck'
import OrganisationService from './organisationService'
import PersonService from './personService'
import ReferralService from './referralService'
import UserService from './userService'
import type { AuditConfig } from '../config'
import config from '../config'
import {
  caseloadClientBuilder,
  courseClientBuilder,
  hmppsAuthClientBuilder,
  hmppsManageUsersClientBuilder,
  prisonClientBuilder,
  prisonerClientBuilder,
  referralClientBuilder,
} from '../data'

const services = () => {
  const auditService = new AuditService(config.apis.audit as AuditConfig)
  const organisationService = new OrganisationService(prisonClientBuilder)
  const personService = new PersonService(hmppsAuthClientBuilder, prisonerClientBuilder)
  const referralService = new ReferralService(referralClientBuilder)
  const userService = new UserService(hmppsManageUsersClientBuilder, caseloadClientBuilder)
  const courseService = new CourseService(courseClientBuilder, userService)

  return {
    auditService,
    courseService,
    organisationService,
    personService,
    referralService,
    userService,
  }
}

type Services = ReturnType<typeof services>

export {
  AuditService,
  CourseService,
  OrganisationService,
  PersonService,
  ReferralService,
  UserService,
  healthCheck,
  services,
}

export type { Services }
