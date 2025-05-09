import Page from '../page'
import type { Course, PeopleSearchResponse } from '@accredited-programmes-api'

export default class SexualOffenceFormPage extends Page {
  constructor(prisoner: PeopleSearchResponse) {
    const personName = `${prisoner.firstName} ${prisoner.lastName}`

    super(`Has ${personName} been convicted of a sexual offence?`, {
      pageTitleOverride: "About the person you're referring",
    })
  }

  shouldContainHintText() {
    this.shouldContainText(
      "Not all prisons can offer programmes to all prisoners. To see a list of suitable locations, tell us whether the person you're referring has been convicted of a sexual offence.",
    )
  }

  submitForm(bcCourseVariant: Course) {
    cy.task('stubBuildingChoicesCourseVariant', {
      course: bcCourseVariant,
      isConvictedOfASexualOffence: 'true',
      isInAWomensPrison: 'false',
    })

    this.selectRadioButton('isConvictedOfSexualOffence', 'true')
    this.shouldContainButton('Continue').click()
  }
}
