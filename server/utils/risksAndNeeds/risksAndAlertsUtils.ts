import StringUtils from '../stringUtils'
import type { RiskLevel, RisksAndAlerts } from '@accredited-programmes/models'
import type { OspBox, RiskBox, RiskLevelOrUnknown } from '@accredited-programmes/ui'
import type { GovukFrontendTable, GovukFrontendTableCell } from '@govuk-frontend'

export default class RisksAndAlertsUtils {
  static ospBox(type: OspBox['type'], level?: RiskLevel): OspBox {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      levelClass: RisksAndAlertsUtils.levelClass('osp-box', levelOrUnknown),
      levelText: RisksAndAlertsUtils.levelText(levelOrUnknown),
      type,
    }
  }

  static riskBox(category: RiskBox['category'], level?: RiskLevel, figure?: string): RiskBox {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      category,
      figure,
      levelClass: RisksAndAlertsUtils.levelClass('risk-box', levelOrUnknown),
      levelText: RisksAndAlertsUtils.levelText(levelOrUnknown),
    }
  }

  static roshTable(risksAndAlerts: RisksAndAlerts): GovukFrontendTable {
    return {
      classes: 'rosh-table',
      head: [{ text: 'Risk to' }, { text: 'Custody' }, { text: 'Community' }],
      rows: [
        [
          { text: 'Children' },
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskChildrenCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskChildrenCommunity),
        ],
        [
          { text: 'Public' },
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskPublicCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskPublicCommunity),
        ],
        [
          { text: 'Known adult' },
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskKnownAdultCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskKnownAdultCommunity),
        ],
        [
          { text: 'Staff' },
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskStaffCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskStaffCommunity),
        ],
        [
          { text: 'Prisoners' },
          RisksAndAlertsUtils.roshTableCellForLevel(risksAndAlerts.riskPrisonersCustody),
          { classes: 'rosh-table__cell', text: 'Not applicable' },
        ],
      ],
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

  private static roshTableCellForLevel(level?: RiskLevel): GovukFrontendTableCell {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      classes: `rosh-table__cell ${RisksAndAlertsUtils.levelClass('rosh-table__cell', levelOrUnknown)}`,
      text: RisksAndAlertsUtils.levelText(levelOrUnknown, 'proper'),
    }
  }
}