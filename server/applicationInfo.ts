import { buildNumber, gitRef, packageData } from './applicationVersion'

type ApplicationInfo = {
  applicationName: string
  branchName: string
  buildNumber: string
  gitRef: string
  productId: string
}

export default (): ApplicationInfo => ({
  applicationName: packageData.name,
  branchName: process.env.GIT_BRANCH || 'unknown',
  buildNumber,
  gitRef,
  productId: process.env.PRODUCT_ID || 'UNASSIGNED',
})

export type { ApplicationInfo }
