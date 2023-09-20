import authorisationMiddleware from './authorisationMiddleware'

enum ApplicationRoles {
  ACP_REFERRER = 'ACP_REFERRER',
}

const checkUserHasReferrerAuthority = () => authorisationMiddleware([ApplicationRoles.ACP_REFERRER])

export { ApplicationRoles, checkUserHasReferrerAuthority }
