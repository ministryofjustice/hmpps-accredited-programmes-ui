import StringUtils from '../stringUtils'
import type { RiskLevel, Risks } from '@accredited-programmes/api'
import type { OspBox, RiskBox, RiskLevelOrUnknown } from '@accredited-programmes/ui'
import type { GovukFrontendTable, GovukFrontendTableCell } from '@govuk-frontend'

export default class RisksAndAlertsUtils {
  static levelOrUnknown(level?: RiskLevel): RiskLevelOrUnknown {
    return level || 'UNKNOWN'
  }

  static levelText(level: RiskLevelOrUnknown, casing: 'proper' | 'upper' = 'upper'): string {
    let text = level.split('_').join(' ')

    if (casing === 'proper') {
      text = StringUtils.properCase(text)
    }

    return text
  }

  static ospBox(type: OspBox['type'], level?: RiskLevel): OspBox {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      dataTestId: `${type.toLowerCase().replace('/', '-')}-box`,
      levelClass: RisksAndAlertsUtils.levelClass('osp-box', levelOrUnknown),
      levelText: RisksAndAlertsUtils.levelText(levelOrUnknown),
      type,
    }
  }

  static riskBox(
    category: RiskBox['category'],
    level?: RiskLevel,
    figure?: string,
    dataTestIdPrefix?: string,
  ): RiskBox {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      category,
      dataTestId: `${dataTestIdPrefix || category.toLowerCase().replace(/\s/g, '-')}-risk-box`,
      figure,
      levelClass: RisksAndAlertsUtils.levelClass('risk-box', levelOrUnknown),
      levelText: RisksAndAlertsUtils.levelText(levelOrUnknown),
    }
  }

  static roshTable(risks: Risks): GovukFrontendTable {
    return {
      classes: 'rosh-table',
      head: [{ text: 'Risk to' }, { text: 'Custody' }, { text: 'Community' }],
      rows: [
        [
          { text: 'Children' },
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskChildrenCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskChildrenCommunity),
        ],
        [
          { text: 'Public' },
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskPublicCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskPublicCommunity),
        ],
        [
          { text: 'Known adult' },
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskKnownAdultCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskKnownAdultCommunity),
        ],
        [
          { text: 'Staff' },
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskStaffCustody),
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskStaffCommunity),
        ],
        [
          { text: 'Prisoners' },
          RisksAndAlertsUtils.roshTableCellForLevel(risks.riskPrisonersCustody),
          { classes: 'rosh-table__cell', text: 'Not applicable' },
        ],
      ],
    }
  }

  private static levelClass(baseClass: string, level: RiskLevelOrUnknown): string {
    return `${baseClass}--${level.split('_').join('-').toLowerCase()}`
  }

  private static roshTableCellForLevel(level?: RiskLevel): GovukFrontendTableCell {
    const levelOrUnknown = RisksAndAlertsUtils.levelOrUnknown(level)

    return {
      classes: `rosh-table__cell ${RisksAndAlertsUtils.levelClass('rosh-table__cell', levelOrUnknown)}`,
      text: RisksAndAlertsUtils.levelText(levelOrUnknown, 'proper'),
    }
  }
}
