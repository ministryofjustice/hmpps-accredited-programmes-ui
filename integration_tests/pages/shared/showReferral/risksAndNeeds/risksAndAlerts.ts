import { CourseUtils, RisksAndAlertsUtils } from '../../../../../server/utils'
import Helpers from '../../../../support/helpers'
import Page from '../../../page'
import type { Course, RiskLevel, RisksAndAlerts } from '@accredited-programmes/models'
import type { RiskBox } from '@accredited-programmes/ui'

export default class RisksAndAlertsPage extends Page {
  risksAndAlerts: RisksAndAlerts

  constructor(args: { course: Course; risksAndAlerts: RisksAndAlerts }) {
    const { course, risksAndAlerts } = args

    const coursePresenter = CourseUtils.presentCourse(course)

    super(`Referral to ${coursePresenter.displayName}`)

    this.risksAndAlerts = risksAndAlerts
  }

  shouldContainNoRisksAndAlertsSummaryCard() {
    cy.get('[data-testid="no-risks-and-alerts-summary-card"]').then(summaryCardElement => {
      this.shouldContainKeylessSummaryCard(
        'Risks and alerts',
        'No risks and alerts data found in OASys or NOMIS. Add risks and alerts data to OASys and/or NOMIS to see them here.',
        summaryCardElement,
      )
    })
  }

  shouldHaveAlertsInformation() {
    cy.get('[data-testid="alerts-heading"]').should('have.text', 'Active risk alerts')

    if (this.risksAndAlerts.alerts?.length) {
      const groupedAlerts = RisksAndAlertsUtils.alertsGroupTables(this.risksAndAlerts.alerts)

      groupedAlerts.forEach((groupedAlert, groupIndex) => {
        cy.get(`[data-testid="alerts-group-table-${groupIndex + 1}"]`).within(() => {
          cy.get('caption').should('have.text', groupedAlert.caption)
          cy.get('.govuk-table__header').eq(0).should('have.text', 'Details')
          cy.get('.govuk-table__header').eq(1).should('have.text', 'Start date')
          groupedAlert.rows.forEach((row, rowIndex) => {
            cy.get('.govuk-table__row')
              .eq(rowIndex + 1)
              .within(() => {
                cy.get('.govuk-table__cell').eq(0).should('have.text', row[0].text)
                cy.get('.govuk-table__cell').eq(1).should('have.text', row[1].text)
              })
          })
        })
      })
    } else {
      cy.get('[data-testid="no-risks-message"]').should('have.text', 'No risks found.')
    }
  }

  shouldHaveOgrsInformation() {
    cy.get('[data-testid="ogrs-heading"]').should('have.text', 'Offender group reconviction scale')

    cy.get('[data-testid="ogrs-year-1-risk-box"]').then(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(
        riskBoxElement,
        'OGRS Year 1',
        this.risksAndAlerts.ogrsRisk,
        this.risksAndAlerts.ogrsYear1 ? `${this.risksAndAlerts.ogrsYear1}%` : undefined,
      )
    })

    cy.get('[data-testid="ogrs-year-2-risk-box"]').then(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(
        riskBoxElement,
        'OGRS Year 2',
        this.risksAndAlerts.ogrsRisk,
        this.risksAndAlerts.ogrsYear2 ? `${this.risksAndAlerts.ogrsYear2}%` : undefined,
      )
    })
  }

  shouldHaveOvpInformation() {
    cy.get('[data-testid="ovp-heading"]').should('have.text', 'Offender violence predictor')

    cy.get('[data-testid="ovp-year-1-risk-box"]').then(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(
        riskBoxElement,
        'OVP Year 1',
        this.risksAndAlerts.ovpRisk,
        this.risksAndAlerts.ovpYear1 ? `${this.risksAndAlerts.ovpYear1}%` : undefined,
      )
    })

    cy.get('[data-testid="ovp-year-2-risk-box"]').then(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(
        riskBoxElement,
        'OVP Year 2',
        this.risksAndAlerts.ovpRisk,
        this.risksAndAlerts.ovpYear2 ? `${this.risksAndAlerts.ovpYear2}%` : undefined,
      )
    })
  }

  shouldHaveRoshInformation() {
    cy.get('[data-testid="rosh-heading"]').should('have.text', 'Risk of serious harm')

    cy.get('[data-testid="rosh-risk-box"]').within(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(riskBoxElement, 'RoSH', this.risksAndAlerts.overallRoshLevel)

      cy.get('p').then(descriptionElement => {
        const { actual, expected } = Helpers.parseHtml(descriptionElement, 'Risk of serious harm')
        expect(actual).to.equal(expected)
      })

      cy.get('.govuk-table__header').eq(0).should('have.text', 'Risk to')
      cy.get('.govuk-table__header').eq(1).should('have.text', 'Custody')
      cy.get('.govuk-table__header').eq(2).should('have.text', 'Community')
      cy.get('.govuk-table__body').within(() => {
        cy.get('.govuk-table__row')
          .eq(0)
          .within(tableRowElement => {
            cy.get('.govuk-table__cell').eq(0).should('have.text', 'Children')
            this.shouldHaveLevelTextInCell(tableRowElement, 1, this.risksAndAlerts.riskChildrenCustody)
            this.shouldHaveLevelTextInCell(tableRowElement, 2, this.risksAndAlerts.riskChildrenCommunity)
          })

        cy.get('.govuk-table__row')
          .eq(1)
          .within(tableRowElement => {
            cy.get('.govuk-table__cell').eq(0).should('have.text', 'Public')
            this.shouldHaveLevelTextInCell(tableRowElement, 1, this.risksAndAlerts.riskPublicCustody)
            this.shouldHaveLevelTextInCell(tableRowElement, 2, this.risksAndAlerts.riskPublicCommunity)
          })

        cy.get('.govuk-table__row')
          .eq(2)
          .within(tableRowElement => {
            cy.get('.govuk-table__cell').eq(0).should('have.text', 'Known adult')
            this.shouldHaveLevelTextInCell(tableRowElement, 1, this.risksAndAlerts.riskKnownAdultCustody)
            this.shouldHaveLevelTextInCell(tableRowElement, 2, this.risksAndAlerts.riskKnownAdultCommunity)
          })

        cy.get('.govuk-table__row')
          .eq(3)
          .within(tableRowElement => {
            cy.get('.govuk-table__cell').eq(0).should('have.text', 'Staff')
            this.shouldHaveLevelTextInCell(tableRowElement, 1, this.risksAndAlerts.riskStaffCustody)
            this.shouldHaveLevelTextInCell(tableRowElement, 2, this.risksAndAlerts.riskStaffCommunity)
          })

        cy.get('.govuk-table__row')
          .eq(4)
          .within(tableRowElement => {
            cy.get('.govuk-table__cell').eq(0).should('have.text', 'Prisoners')
            this.shouldHaveLevelTextInCell(tableRowElement, 1, this.risksAndAlerts.riskPrisonersCustody)
            cy.get('.govuk-table__cell').eq(2).should('have.text', 'Not applicable')
          })
      })
    })
  }

  shouldHaveRsrInformation() {
    cy.get('[data-testid="rsr-heading"]').should('have.text', 'Risk of serious recidivism')

    cy.get('[data-testid="rsr-risk-box"]').within(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(
        riskBoxElement,
        'RSR',
        this.risksAndAlerts.rsrRisk,
        this.risksAndAlerts.rsrScore?.toString(),
      )

      cy.get('[data-testid="osp-c-box"]').then(ospcBoxElement => {
        const { actual, expected } = Helpers.parseHtml(
          ospcBoxElement,
          `${RisksAndAlertsUtils.levelText(RisksAndAlertsUtils.levelOrUnknown(this.risksAndAlerts.ospcScore))} OSP/C`,
        )
        expect(actual).to.equal(expected)
      })

      cy.get('[data-testid="osp-i-box"]').then(ospiBoxElement => {
        const { actual, expected } = Helpers.parseHtml(
          ospiBoxElement,
          `${RisksAndAlertsUtils.levelText(RisksAndAlertsUtils.levelOrUnknown(this.risksAndAlerts.ospiScore))} OSP/I`,
        )
        expect(actual).to.equal(expected)
      })
    })
  }

  shouldHaveSaraInformation() {
    cy.get('[data-testid="sara-heading"]').should('have.text', 'Spousal assault risk assessment')

    cy.get('[data-testid="sara-partner-risk-box"]').within(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(riskBoxElement, 'SARA', this.risksAndAlerts.imminentRiskOfViolenceTowardsPartner)

      cy.get('p').then(descriptionElement => {
        const { actual, expected } = Helpers.parseHtml(descriptionElement, 'Risk of violence towards partner')
        expect(actual).to.equal(expected)
      })
    })

    cy.get('[data-testid="sara-others-risk-box"]').within(riskBoxElement => {
      this.shouldHaveRiskBoxHeading(riskBoxElement, 'SARA', this.risksAndAlerts.imminentRiskOfViolenceTowardsOthers)

      cy.get('p').then(descriptionElement => {
        const { actual, expected } = Helpers.parseHtml(descriptionElement, 'Risk of violence towards others')
        expect(actual).to.equal(expected)
      })
    })
  }

  private shouldHaveLevelTextInCell(tableRowElement: JQuery<HTMLElement>, cellIndex: number, level?: RiskLevel) {
    cy.wrap(tableRowElement).within(() => {
      cy.get('.govuk-table__cell')
        .eq(cellIndex)
        .should('have.text', RisksAndAlertsUtils.levelText(RisksAndAlertsUtils.levelOrUnknown(level), 'proper'))
    })
  }

  private shouldHaveRiskBoxHeading(
    riskBoxElement: JQuery<HTMLElement>,
    category: RiskBox['category'],
    level?: RiskLevel,
    figure?: RiskBox['figure'],
  ) {
    const expectedText = [RisksAndAlertsUtils.levelText(RisksAndAlertsUtils.levelOrUnknown(level)), category, figure]
      .filter(element => element)
      .join(' ')

    cy.wrap(riskBoxElement).within(() => {
      cy.get('h4').then(riskBoxHeadingElement => {
        const { actual, expected } = Helpers.parseHtml(riskBoxHeadingElement, expectedText)
        expect(actual).to.equal(expected)
      })
    })
  }
}
