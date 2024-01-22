import StringUtils from '../stringUtils'
import type { RiskLevel } from '@accredited-programmes/models'
import type { OspBox, RiskLevelOrUnknown } from '@accredited-programmes/ui'

export default class RisksAndAlertsUtils {
  static ospBox(type: OspBox['type'], level?: RiskLevel): OspBox {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      levelClass: RisksAndAlertsUtils.levelClass('osp-box', levelOrUnknown),
      levelText: RisksAndAlertsUtils.levelText(levelOrUnknown),
      type,
    }
  }

  private static levelClass(baseClass: string, level: RiskLevelOrUnknown): string {
    return `${baseClass}--${level.split('_').join('-').toLowerCase()}`
  }

  private static levelOrUnknown(level?: RiskLevel): RiskLevelOrUnknown {
    return level || 'UNKNOWN'
  }

  private static levelText(level: RiskLevelOrUnknown, casing: 'proper' | 'upper' = 'upper'): string {
    let text = level.split('_').join(' ')

    if (casing === 'proper') {
      text = StringUtils.properCase(text)
    }

    return text
  }
}
