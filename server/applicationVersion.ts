import fs from 'fs'
import path from 'path'

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())

// Resolved relative to this file rather than the working directory, as the Dockerfile copies build-info.json into dist
const buildInfoPath = path.join(__dirname, '../build-info.json')

const { buildNumber, gitRef } = fs.existsSync(buildInfoPath)
  ? JSON.parse(fs.readFileSync(buildInfoPath).toString())
  : {
      buildNumber: packageData.version,
      gitRef: 'unknown',
    }

export { buildNumber, gitRef, packageData }
